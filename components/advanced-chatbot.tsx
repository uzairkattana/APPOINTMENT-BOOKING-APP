"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Send,
  X,
  Bot,
  User,
  Languages,
  Search,
  HelpCircle,
  Copy,
  Info,
  Activity,
  Dumbbell,
  AlertTriangle,
  ClipboardList,
  FileCheck,
  BarChart3,
  LineChart
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
// import { voiceService } from "../lib/voice-service"
// import { googleAIService } from "../lib/google-ai-service"
import { generateKnowledgeResponse } from "../lib/chatbot-knowledge"
import { useLanguage } from "@/components/language-provider"
import { AnalyticsTracker } from "@/lib/analytics"
// Speech recognition types will be handled inline

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
  type?: "text" | "appointment" | "location" | "booking"
}

interface AppointmentData {
  name?: string
  phone?: string
  email?: string
  preferredTime?: string
  sessionType?: "in_clinic" | "video"
  notes?: string
  step: number
}


export function AdvancedChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const chatbotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        chatbotRef.current &&
        !chatbotRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [chatbotRef])
  const { language, setLanguage } = useLanguage()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your Gonstead Chiropractic assistant. I can help you book appointments, answer questions about treatments, or connect you with Bashir Khan Chiropractic. How can I assist you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [compact, setCompact] = useState(false)
  const [isNarrow, setIsNarrow] = useState(false)
  const [showQuick, setShowQuick] = useState(false)
  const [faqQuery, setFaqQuery] = useState("")
  const [faqSelected, setFaqSelected] = useState<string | null>(null)
  const [appointmentBooking, setAppointmentBooking] = useState<AppointmentData | null>(null)

  // Quick ready-made questions and answers (no API needed)
  type QuickCategory = 'booking' | 'clinic' | 'treatment' | 'conditions'
  type DetailSection = { title: string; titleUr?: string; items: string[]; itemsUr?: string[] }
  type QQ = { id: string; label: string; labelUr?: string; category: QuickCategory; answer: string; answerUr?: string; sections?: DetailSection[] }
  const quickQuestions: QQ[] = [
    // TREATMENT (Gonstead and care process)
    {
      id: 'gonstead', label: 'What is Gonstead Technique?', labelUr: 'گونسٹیڈ تکنیک کیا ہے؟', category: 'treatment' as QuickCategory, answer: 'Gonstead is a highly precise chiropractic method based on systematic analysis. Unlike generalized adjustments, Gonstead uses posture assessment, motion testing, palpation (touch), specialized instrumentation like the Nervoscope, and sometimes X-rays to identify the exact spinal segment causing dysfunction. This precision allows us to deliver specific, controlled adjustments to restore proper alignment and nerve function for long-term relief, not just temporary symptom management.', answerUr: 'گونسٹیڈ ایک نہایت درست کائروپریکٹک طریقہ ہے جو منظم تجزیے پر مبنی ہے۔ عام ایڈجسٹمنٹ کے برعکس، گونسٹیڈ پوسچر کی جانچ، حرکت کی ٹیسٹنگ، لمس، نرو سکوپ جیسی خصوصی آلات، اور کبھی کبھی ایکس رے استعمال کرتے ہوئے درست اسپائنل سیگمنٹ کی شناخت کرتا ہے۔ یہ درستگی ہمیں عارضی علامات کی بجائے طویل مدتی بہتری کے لیے مخصوص، کنٹرولڈ ایڈجسٹمنٹ فراہم کرنے کی اجازت دیتی ہے۔', sections: [
        { title: 'Five-Step Analysis', titleUr: 'پانچ مرحلہ تجزیہ', items: ['1. Visualization: Assess posture and gait patterns to spot structural imbalances', '2. Instrumentation: Nervoscope detects areas of nerve irritation (heat)—reveals subluxations other methods miss', '3. Static Palpation: Feel tissue texture, muscle tone, and temperature to locate dysfunction', '4. Motion Palpation: Test each joint for restrictions or excessive movement', '5. X-ray Analysis: When clinically indicated, provides biomechanical insight and rules out serious pathology'], itemsUr: ['1. بصری جانچ: پوسچر اور چلنے کی حرکات کو دیکھ کر ڈھانچے میں عدم توازن کو سمجھنا', '2. آلات کا استعمال: نرو سکوپ اسپائنل جلن والے حصے کو ظاہر کرتا ہے—دوسرے طریقے سے چھوٹی خرابیوں کو سمجھا جا سکتا ہے', '3. لمس کے ذریعے جانچ: ٹشو کی ساخت، پٹھوں کی حالت اور درجہ حرارت محسوس کرنا', '4. حرکت کی جانچ: ہر جوڑ کو محدودیت یا زیادہ حرکت کے لیے ٹیسٹ کرنا', '5. ایکس رے تجزیہ: ضرورت پڑنے پر بائیو میکانکل تفہیم اور سنگین مسائل سے انکار'] },
        { title: 'Why Precision Matters', titleUr: 'درستگی کیوں اہم ہے', items: ['Avoids unnecessary corrections to unaffected segments', 'Reduces treatment time and number of visits needed', 'Minimizes risk of over-treating or under-treating', 'Allows for predictable, reproducible results', 'Empowers patients with clear understanding of their condition'], itemsUr: ['غیر متاثر حصوں میں غیر ضروری اصلاحات سے بچاتا ہے', 'علاج کے وقت اور وزٹس کی تعداد کو کم کرتا ہے', 'زیادہ علاج یا کم علاج کے خطرے کو کم کرتا ہے', 'قابل پیش گوئی اور دہرائے جانے والے نتائج فراہم کرتا ہے', 'مریضوں کو ان کی حالت کی واضح سمجھ دیتا ہے'] },
        { title: 'Benefits You\'ll Notice', titleUr: 'فوائل جو آپ محسوس کریں گے', items: ['Faster symptom relief (many improve within 1-3 visits)', 'Fewer adjustments needed for lasting results', 'Better understanding of your spinal health', 'Prevention of future problems through proper alignment', 'Improved overall function and quality of life'], itemsUr: ['تیز علامات میں بہتری (بہت سے لوگ 1-3 وزٹس میں بہتر ہو جاتے ہیں)', 'دیرپا نتائج کے لیے کم ایڈجسٹمنٹ کی ضرورت', 'آپ کی ریڑھ کی ہڈی کی صحت کی بہتر سمجھ', 'صحیح سیدھائی کے ذریعے مستقبل کے مسائل سے بچاؤ', 'مجموعی فنکشن اور زندگی کے معیار میں بہتری'] },
        { title: 'Aftercare & Self-Care', titleUr: 'علاج کے بعد اور خود نگہداشت', items: ['Hydration is crucial—drink extra water to support disc healing and flushing toxins', 'Avoid heavy lifting, strenuous exercise for 24 hours (body is rebalancing)', 'Ice 10–15 minutes if soreness occurs (not heat—heat increases inflammation initially)', 'Continue recommended exercises and posture corrections at home', 'Follow up appointments are critical for stability and prevention'], itemsUr: ['ہائیڈریشن بہت ضروری ہے—اضافی پانی ڈسک کی بحالی اور زہریلے مادوں کو نکالنے میں مدد دے', 'ہنگامی 24 گھنٹوں میں بھاری وزن، سخت ورزش سے بچیں (جسم دوبارہ توازن میں آ رہا ہے)', 'اگر خرابی ہو تو برف 10-15 منٹ لگائیں (حرارت نہیں—حرارت ابتدائی طور پر سوجش بڑھاتی ہے)', 'گھر میں تجویز کردہ ورزشیں اور پوسچر کی اصلاحات جاری رکھیں', 'فالو اپ ملاقاتیں استحکام اور بچاؤ کے لیے اہم ہیں'] }
      ]
    },
    { id: 'first_visit', label: 'What happens on first visit?', labelUr: 'پہلی وزٹ پر کیا ہوتا ہے؟', category: 'treatment' as QuickCategory, answer: 'Detailed history, posture/spinal assessment, ortho/neurological checks, Gonstead analysis; X‑rays only if clinically needed before specific adjustment.', answerUr: 'تفصیلی ہسٹری، پوسچر/اسپائنل اسسمنٹ، آرتھو/نیورو چیکس اور گونسٹیڈ اینالیسز؛ ایکس رے صرف طبی ضرورت پر۔' },
    { id: 'xray', label: 'Do I need X-rays?', labelUr: 'کیا ایکس رے ضروری ہے؟', category: 'treatment' as QuickCategory, answer: 'Only when clinically necessary for safety and precision. Many cases are evaluated without X‑rays.', answerUr: 'صرف طبی بنیادوں پر ضرورت ہونے پر—اکثر کیسز بغیر ایکس رے کے بھی دیکھے جاتے ہیں۔' },
    { id: 'sessions', label: 'How many sessions will I need?', labelUr: 'مجھے کتنے سیشنز درکار ہوں گے؟', category: 'treatment' as QuickCategory, answer: 'Varies by condition and healing response. Many improve within 1–3 sessions; plans are personalized for stability.', answerUr: 'آپ کی حالت اور بحالی کے مطابق—اکثر 1–3 سیشنز میں واضح بہتری، پلان ذاتی ضرورت کے مطابق۔' },
    { id: 'adjustment_feel', label: 'Do adjustments hurt?', labelUr: 'ایڈجسٹمنٹ میں درد ہوتا ہے؟', category: 'treatment' as QuickCategory, answer: 'Most patients feel relief. Adjustments are specific and controlled; mild soreness like post‑exercise can occur briefly.', answerUr: 'زیادہ تر مریضوں کو آرام محسوس ہوتا ہے؛ ایڈجسٹمنٹ نہایت مخصوص اور کنٹرولڈ ہوتے ہیں—ہلکی سی اکڑاہٹ عارضی ہو سکتی ہے۔' },
    { id: 'safety', label: 'Is chiropractic safe?', labelUr: 'کیا کائروپریکٹک محفوظ ہے؟', category: 'treatment' as QuickCategory, answer: 'Yes when performed by a qualified practitioner. Gonstead’s emphasis on analysis makes it exceptionally safe.', answerUr: 'جی ہاں—ماہر کے ذریعہ کیا گیا کائروپریکٹک محفوظ ہے؛ گونسٹیڈ میں جامع تجزیہ سے حفاظت مزید بہتر ہوتی ہے۔' },
    { id: 'aftercare', label: 'What should I do after treatment?', labelUr: 'علاج کے بعد کیا کرنا چاہیے؟', category: 'treatment' as QuickCategory, answer: 'Hydrate, avoid strenuous activity for 24 hours, use ice for soreness, follow posture and exercise advice.', answerUr: 'زیادہ پانی پئیں، 24 گھنٹے بھاری کام سے پرہیز کریں، اکڑاہٹ ہو تو برف لگائیں، پوسچر اور ورزش کی ہدایات پر عمل کریں۔' },
    { id: 'exercise', label: 'Will I get exercises?', labelUr: 'کیا مجھے ورزشیں دی جائیں گی؟', category: 'treatment' as QuickCategory, answer: 'Yes—targeted mobility, stabilization, and ergonomic guidance to support your correction and prevent relapse.', answerUr: 'جی ہاں—ہدفی موبلٹی، اسٹیبلائزیشن اور ارگنومکس رہنمائی دی جاتی ہے تاکہ درستگی برقرار رہے اور مسئلہ واپس نہ آئے۔' },
    { id: 'followup', label: 'When is follow-up needed?', labelUr: 'فالو اپ کب ضروری ہے؟', category: 'treatment' as QuickCategory, answer: 'Follow‑ups are based on your response and goals; initially closer together, then tapered for stability.', answerUr: 'آپ کے ریسپانس اور اہداف کے مطابق—شروع میں قریب قریب، پھر بتدریج وقفہ بڑھایا جاتا ہے۔' },
    { id: 'kids', label: 'Can children get chiropractic?', labelUr: 'کیا بچوں کے لیے کائروپریکٹک ممکن ہے؟', category: 'treatment' as QuickCategory, answer: 'Yes, techniques are modified to be very gentle and age‑appropriate for infants to teens.', answerUr: 'جی ہاں—بچوں کے لیے تکنیک نہایت نرم اور عمر کے مطابق تبدیل کی جاتی ہیں (نوزائیدہ سے نوجوان تک)۔' },
    { id: 'older_adults', label: 'Is it safe for older adults?', labelUr: 'بزرگ مریضوں کے لیے محفوظ ہے؟', category: 'treatment' as QuickCategory, answer: 'Yes—Gonstead uses gentle, specific adjustments adapted to bone density and mobility.', answerUr: 'جی ہاں—بون ڈینسٹی اور موبلٹی کے مطابق نہایت نرم اور مخصوص ایڈجسٹمنٹ کی جاتی ہیں۔' },
    { id: 'pregnancy', label: 'Is it safe in pregnancy?', labelUr: 'کیا حمل میں یہ محفوظ ہے؟', category: 'treatment' as QuickCategory, answer: 'Yes—with modified positioning and gentle techniques to relieve low back, pelvic, and rib discomfort.', answerUr: 'جی ہاں—حمل کے دوران محفوظ اور نرم تکنیکیں استعمال کی جاتی ہیں جو لوئر بیک، پیلوک اور پسلیوں کے درد میں آرام دیتی ہیں۔' },
    { id: 'contra', label: 'Who should avoid adjustments?', labelUr: 'کن لوگوں کو ایڈجسٹمنٹ نہیں کرانی چاہیے؟', category: 'treatment' as QuickCategory, answer: 'Absolute contraindications are rare. We screen for red flags and refer when needed; safety is first.', answerUr: 'بالکل منع والے کیسز بہت کم ہوتے ہیں؛ ریڈ فلیگز کی اسکریننگ کی جاتی ہے اور ضرورت ہو تو ریفر کیا جاتا ہے—حفاظت اولین ترجیح ہے۔' },
    { id: 'duration', label: 'How long is a session?', labelUr: 'سیشن کتنی دیر کا ہوتا ہے؟', category: 'treatment' as QuickCategory, answer: 'Initial 45–90 minutes (exam + first care if appropriate). Follow‑ups 20–45 minutes depending on the plan.', answerUr: 'ابتدائی 45–90 منٹ (معائنہ + ضرورت ہو تو پہلی کیئر)، فالو اپ 20–45 منٹ پلان کے مطابق۔' },
    { id: 'manual_vs_machine', label: 'Manual vs machine-assisted?', labelUr: 'مینول یا مشین اسسٹڈ؟', category: 'treatment' as QuickCategory, answer: 'We select the most precise, safe method for your case; both can be used to improve specificity and comfort.', answerUr: 'کیس کے مطابق سب سے محفوظ اور درست طریقہ منتخب کیا جاتا ہے؛ دونوں طریقے مخصوصیت اور آرام بڑھانے میں مدد دیتے ہیں۔' },

    // CLINIC (info, logistics)
    { id: 'hours', label: 'Clinic hours', labelUr: 'کلینک کے اوقات', category: 'clinic' as QuickCategory, answer: 'Mon–Sat 9:00 AM–6:00 PM; Sunday emergency only. Call +92 304 699 6267 for urgent care.', answerUr: 'پیر تا ہفتہ 9:00 صبح–6:00 شام؛ اتوار صرف ایمرجنسی۔ فوری مدد: +92 304 699 6267' },
    { id: 'location', label: 'Clinic location', labelUr: 'کلینک کہاں ہے؟', category: 'clinic' as QuickCategory, answer: 'Near Peshawar Model School, Tehsil Road, Nowshera (Khyber Pakhtunkhwa). See Contact section for map.', answerUr: 'پشاور ماڈل اسکول کے قریب، تحصیل روڈ، نوشہرہ۔ نقشہ کانٹیکٹ سیکشن میں موجود ہے۔' },
    { id: 'payments', label: 'Payment methods', labelUr: 'ادائیگی کے طریقے', category: 'clinic' as QuickCategory, answer: 'Cash, JazzCash, and Easypaisa accepted. Fees are shared at booking after assessment.', answerUr: 'کیش، جاز کیش، ایزی پیسہ دستیاب—فیس اسیسمنٹ کے بعد بکنگ پر بتا دی جاتی ہے۔' },
    { id: 'languages', label: 'Languages supported', labelUr: 'کن زبانوں میں رہنمائی دستیاب ہے؟', category: 'clinic' as QuickCategory, answer: 'English and Urdu. We communicate in the language you’re most comfortable with.', answerUr: 'انگریزی اور اردو—جس زبان میں آپ کو سہولت ہو ہم اسی میں رہنمائی کرتے ہیں۔' },
    { id: 'emergency', label: 'Emergency care?', labelUr: 'ایمرجنسی کیئر دستیاب ہے؟', category: 'clinic' as QuickCategory, answer: 'Yes—call +92 304 699 6267. We prioritize acute pain and urgent cases the same day when possible.', answerUr: 'جی ہاں—+92 304 699 6267 پر کال کریں؛ شدید درد اور ایمرجنسی کیسز کو ممکنہ حد تک اسی دن ترجیح دی جاتی ہے۔' },
    { id: 'parking', label: 'Parking availability', labelUr: 'پارکنگ دستیاب ہے؟', category: 'clinic' as QuickCategory, answer: 'Free parking is available directly in front of the clinic.', answerUr: 'جی ہاں—کلینک کے سامنے مفت پارکنگ دستیاب ہے۔' },
    { id: 'equipment', label: 'What equipment is used?', labelUr: 'کلینک میں کون سا سامان استعمال ہوتا ہے؟', category: 'clinic' as QuickCategory, answer: 'Gonstead tables, Nervoscope, and digital X‑ray (when indicated) to increase precision and safety.', answerUr: 'گونسٹیڈ ٹیبلز، نرو سکوپ اور ضرورت پڑنے پر ڈیجیٹل ایکس رے—تاکہ درستگی اور حفاظت بہتر بنے۔' },
    { id: 'records', label: 'Do you review past reports?', labelUr: 'کیا آپ پرانے ٹیسٹ/رپورٹس دیکھتے ہیں؟', category: 'clinic' as QuickCategory, answer: 'Yes—bring prior X‑rays/MRI/CT and reports; they help tailor your plan.', answerUr: 'جی ہاں—پرانے ایکس رے/ایم آر آئی/سی ٹی اور رپورٹس ساتھ لائیں؛ اس سے پلان بہتر بنایا جا سکتا ہے۔' },
    { id: 'informed_consent', label: 'Do you explain risks?', labelUr: 'کیا آپ فوائد/خطرات سمجھاتے ہیں؟', category: 'clinic' as QuickCategory, answer: 'Yes—findings, benefits, and risks are explained; we proceed only with your informed consent.', answerUr: 'جی ہاں—نتائج، فوائد اور ممکنہ خطرات واضح طور پر بتائے جاتے ہیں؛ آپ کی رضامندی کے بعد ہی عمل کیا جاتا ہے۔' },
    { id: 'privacy', label: 'Is my data private?', labelUr: 'کیا میری معلومات محفوظ رہتی ہیں؟', category: 'clinic' as QuickCategory, answer: 'Yes—your information is confidential and used only for your care per clinic policy.', answerUr: 'جی ہاں—آپ کا ڈیٹا رازداری کے ساتھ محفوظ رکھا جاتا ہے اور صرف علاج کے لیے استعمال ہوتا ہے۔' },
    { id: 'contact_options', label: 'How can I contact?', labelUr: 'رابطے کے طریقے؟', category: 'clinic' as QuickCategory, answer: 'Phone/WhatsApp +92 304 699 6267 or email gonsteadchiropractic.org@gmail.com.', answerUr: 'فون/واٹس ایپ +92 304 699 6267 یا ای میل gonsteadchiropractic.org@gmail.com' },
    { id: 'prep', label: 'How should I prepare?', labelUr: 'ملاقات سے پہلے کیا تیاری کروں؟', category: 'clinic' as QuickCategory, answer: 'Wear comfortable clothing, avoid heavy meals just before, list symptoms/medications, bring prior records.', answerUr: 'آرام دہ لباس پہنیں، فوراً پہلے بھاری کھانے سے پرہیز، علامات/ادویات کی فہرست بنائیں، پرانی رپورٹس ساتھ لائیں۔' },
    { id: 'after_visit', label: 'What after my visit?', labelUr: 'وزٹ کے بعد کیا ہوگا؟', category: 'clinic' as QuickCategory, answer: 'You’ll get a simple plan with do’s/don’ts, posture tips, and exercise as needed; follow‑ups if required.', answerUr: 'آپ کو سادہ پلان (کیا کریں/نہ کریں)، پوسچر ٹپس اور ضرورت کے مطابق ورزشیں دی جائیں گی؛ فالو اپ اگر درکار ہو۔' },

    // BOOKING (process)
    { id: 'booking', label: 'How to book', labelUr: 'بکنگ کیسے کریں؟', category: 'booking' as QuickCategory, answer: 'Use the chat Book button, call/WhatsApp +92 304 699 6267, or use the site’s booking form.', answerUr: 'چیٹ میں بکنگ بٹن، کال/واٹس ایپ +92 304 699 6267، یا ویب سائٹ فارم سے بُک کریں۔' },
    { id: 'same_day', label: 'Same-day appointments?', labelUr: 'کیا آج ہی ملاقات مل سکتی ہے؟', category: 'booking' as QuickCategory, answer: 'Often available for acute pain—contact us early for best chance.', answerUr: 'اکثر شدید درد کے لیے اسی دن ملاقات ممکن—جلدی رابطہ کریں تاکہ موقع بڑھے۔' },
    { id: 'reschedule', label: 'How to reschedule?', labelUr: 'ٹوکن/وقت کیسے تبدیل کریں؟', category: 'booking' as QuickCategory, answer: 'Call/WhatsApp as soon as possible; we’ll arrange the next suitable slot.', answerUr: 'جلد از جلد کال/واٹس ایپ کریں؛ ہم اگلا موزوں وقت طے کر دیں گے۔' },
    { id: 'intake', label: 'Do I fill forms?', labelUr: 'کیا فارم بھرنا ہوگا؟', category: 'booking' as QuickCategory, answer: 'A brief intake may be required to understand your concerns and ensure safety.', answerUr: 'ہو سکتا ہے مختصر فارم درکار ہو تاکہ آپ کے مسئلے کو سمجھا جائے اور حفاظت یقینی ہو۔' },
    { id: 'video', label: 'Do you offer video consults?', labelUr: 'کیا ویڈیو کنسلٹیشن ملتی ہے؟', category: 'booking' as QuickCategory, answer: 'Yes—good for initial advice or follow‑ups. In‑clinic care provides the most comprehensive treatment.', answerUr: 'جی ہاں—ابتدائی رہنمائی یا فالو اپ کے لیے مفید؛ مکمل علاج کیلیے کلینک وزٹ بہترین رہتا ہے۔' },
    { id: 'reminders', label: 'Will I get reminders?', labelUr: 'کیا یاددہانی ملے گی؟', category: 'booking' as QuickCategory, answer: 'Yes—confirmation and reminders via WhatsApp/SMS/email where applicable.', answerUr: 'جی ہاں—جہاں ممکن ہو واٹس ایپ/ایس ایم ایس/ای میل کے ذریعے کنفرمیشن اور ریمائنڈرز بھیجے جاتے ہیں۔' },
    { id: 'duration_booking', label: 'How long should I plan?', labelUr: 'کتنی دیر رکھوں؟', category: 'booking' as QuickCategory, answer: 'Initial: allow up to 60–90 minutes. Follow‑ups: 20–45 minutes depending on care plan.', answerUr: 'ابتدائی وزٹ 60–90 منٹ رکھیں؛ فالو اپ 20–45 منٹ، پلان کے مطابق۔' },
    { id: 'documents', label: 'What should I bring?', labelUr: 'ساتھ کیا لاؤں؟', category: 'booking' as QuickCategory, answer: 'ID, prior imaging/reports, medication list, and any referral notes if available.', answerUr: 'شناختی کارڈ، پرانے ٹیسٹ/رپورٹس، ادویات کی فہرست، اور اگر ہوں تو ریفرل نوٹس۔' },
    { id: 'eligibility', label: 'Am I a candidate?', labelUr: 'کیا میں اس علاج کے لیے موزوں ہوں؟', category: 'booking' as QuickCategory, answer: 'Most musculoskeletal cases are suitable; we screen for red flags and refer if needed.', answerUr: 'زیادہ تر عضلاتی/ہڈیاں جوڑ مسائل اس کے لیے موزوں ہوتے ہیں؛ ریڈ فلیگز کی اسکریننگ اور ضرورت پر ریفرل کیا جاتا ہے۔' },
    { id: 'family', label: 'Can family attend?', labelUr: 'کیا فیملی ساتھ آ سکتی ہے؟', category: 'booking' as QuickCategory, answer: 'Yes—one accompanying person is welcome if you prefer support.', answerUr: 'جی ہاں—اگر آپ چاہیں تو ایک فرد ساتھ آ سکتا ہے۔' },

    // CONDITIONS (common problems)
    {
      id: 'sciatica', label: 'Do you treat sciatica?', labelUr: 'کیا آپ سائیٹکا کا علاج کرتے ہیں؟', category: 'conditions' as QuickCategory, answer: 'Yes, absolutely. Sciatica is one of the most common conditions we treat successfully. Through precise Gonstead analysis, we identify the exact source of nerve pressure—whether it\'s from a lumbar disc, facet joint, or SI joint dysfunction. Specific, targeted adjustments help reduce nerve irritation, alleviate pain radiating down your leg, and restore normal function. Most patients experience significant relief within the first few visits.', answerUr: 'جی ہاں، بلکل۔ سائیٹکا ان عام حالات میں سے ایک ہے جن کا ہم کامیابی سے علاج کرتے ہیں۔ درست گونسٹیڈ تجزیے کے ذریعے، ہم نرو پریشر کی بالکل درست وجہ کی شناخت کرتے ہیں—چاہے وہ لمبر ڈسک، فیسٹ جوائنٹ، یا SI جوائنٹ کی خرابی سے ہو۔ مخصوص، ہدف شدہ ایڈجسٹمنٹ نرو کی جلن کو کم کرنے، ٹانگ میں چلنے والے درد کو دور کرنے، اور عام فنکشن بحال کرنے میں مدد کرتی ہیں۔ زیادہ تر مریض پہلی چند وزٹس کے اندر خاطر خواہ آرام محسوس کرتے ہیں۔', sections: [
        { title: 'Common sources', titleUr: 'عام وجوہات', items: ['Lumbar disc irritation or herniation compressing the nerve root', 'Facet or SI joint dysfunction causing inflammation', 'Piriformis muscle tightness (less common, called "pseudo-sciatica")', 'Spinal stenosis narrowing nerve pathways'], itemsUr: ['لمبر ڈسک کی جلن یا ہرنیا نرو روٹ کو دباتی ہے', 'فیسٹ یا SI جوائنٹ کی خرابی سے سوزش', 'پیریفورمس مسل کی سختی (کم عام، "سوڈو-سائیٹکا" کہلاتا ہے)', 'اسپائنل سٹینوسس نرو راستوں کو تنگ کرتا ہے'] },
        { title: 'Our treatment approach', titleUr: 'ہمارا علاج کا طریقہ', items: ['Precise Gonstead adjustments targeting the specific dysfunctional segment', 'Reduce nerve root irritation and inflammation', 'Activity modification guidance to avoid aggravating movements', 'Neural mobilization techniques (nerve flossing) when appropriate', 'Progressive return to normal activities'], itemsUr: ['مخصوص خراب حصے کو نشانہ بناتے ہوئے درست گونسٹیڈ ایڈجسٹمنٹ', 'نرو روٹ کی جلن اور سوزش کم کرنا', 'بگڑنے والی حرکات سے بچنے کے لیے سرگرمی میں تبدیلی کی رہنمائی', 'مناسب ہونے پر نیورل موبلائزیشن تکنیک (نرو فلاسنگ)', 'عام سرگرمیوں کی طرف تدریجی واپسی'] },
        { title: 'Recommended exercises', titleUr: 'تجویز کردہ ورزشیں', items: ['Gentle walking intervals to promote circulation', 'McKenzie-style gentle back extensions (if tolerated)', 'Gluteal and hip strengthening exercises', 'Core bracing and stabilization', 'Avoid painful forward bending initially'], itemsUr: ['گردش کو فروغ دینے کے لیے نرم چہل قدمی', 'مکینزی اسٹائل نرم کمر کی توسیع (برداشت ہو تو)', 'گلوٹس اور ہپ کو مضبوط کرنے کی ورزشیں', 'کور بریسنگ اور اسٹیبلائزیشن', 'شروع میں دردناک آگے جھکنے سے پرہیز'] },
        { title: 'Warning signs (seek immediate care)', titleUr: 'خطرے کی علامات (فوری طبی مدد)', items: ['Progressive leg weakness or foot drop', 'Loss of bowel or bladder control', 'Saddle anesthesia (numbness in groin/inner thighs)', 'Severe, unrelenting pain despite rest'], itemsUr: ['ٹانگ میں بڑھتی کمزوری یا پاؤں کا گرنا', 'پیشاب یا پاخانے پر کنٹرول کی کمی', 'سیڈل اینستھیزیا (گروین/اندرونی رانوں میں سن ہونا)', 'آرام کے باوجود شدید، لگاتار درد'] }
      ]
    },
    {
      id: 'low_back_pain', label: 'Lower back pain', labelUr: 'کمر/لوئر بیک درد', category: 'conditions' as QuickCategory, answer: 'Common and very responsive to specific correction, posture guidance, and stabilization exercises.', answerUr: 'عام مسئلہ ہے اور مخصوص درستگی، پوسچر رہنمائی اور اسٹیبلائزیشن ورزشوں سے اچھی بہتری آتی ہے۔', sections: [
        { title: 'Likely drivers', items: ['Facet or SI joint mechanics', 'Disc irritation from flexion intolerance', 'Deconditioning and prolonged sitting'] },
        { title: 'Treatment', items: ['Specific Gonstead adjustments for dysfunctional segments', 'Education on pain triggers and pacing', 'Short course of NSAIDs if appropriate (ask your physician)'] },
        { title: 'Exercises', items: ['Walking, gentle extensions, bird‑dog, side planks (as tolerated)', 'Hip hinge practice; avoid end‑range flexion early', 'Gradual return to usual activities'] },
        { title: 'Self‑care', items: ['Ice 10–15 minutes for flare‑ups', 'Break up sitting every 30–45 minutes', 'Sleep with knees slightly elevated or side‑lying with pillow between knees'] }
      ]
    },
    {
      id: 'disc_herniation', label: 'Disc herniation/bulge', labelUr: 'ڈسک ہرنی ایشن/بلج', category: 'conditions' as QuickCategory, answer: 'We focus on biomechanical correction to reduce irritation and support healing; surgery is rarely first line.', answerUr: 'ہم بائیو مکینکل درستگی پر فوکس کرتے ہیں تاکہ جلن کم ہو اور شفا کو مدد ملے؛ سرجری عام طور پر پہلی ترجیح نہیں۔', sections: [
        { title: 'Common causes', items: ['Repeated flexion/rotation under load', 'Deconditioning (weak deep core/hip stabilizers)', 'Prolonged sitting with poor posture'] },
        { title: 'Conservative care', items: ['Specific spinal adjustments to improve mechanics', 'Load management and graded activity', 'Neutral‑spine education and ergonomic coaching'] },
        { title: 'Exercises', items: ['McKenzie‑style extensions if tolerated', 'Hip hinge drills and anti‑rotation core (Pallof press)', 'Glute/hip strengthening and walking intervals'] },
        { title: 'When to seek urgent care', items: ['Progressive leg weakness', 'Bowel/bladder changes', 'Saddle anesthesia (numbness in groin)'] }
      ]
    },
    {
      id: 'neck_pain', label: 'Neck pain', labelUr: 'گردن کا درد', category: 'conditions' as QuickCategory, answer: 'Cervical misalignments are addressed with gentle, specific methods; posture and ergonomics included.', answerUr: 'گردن کی ہڈیوں کی بے ترتیبی کو نرم اور مخصوص طریقوں سے ٹھیک کیا جاتا ہے؛ پوسچر اور ارگنومکس کی رہنمائی شامل ہے۔', sections: [
        { title: 'Common causes', items: ['Prolonged forward head posture', 'Facet joint irritation or muscle guarding', 'Stress and sleep positioning'] },
        { title: 'Treatment', items: ['Gentle specific cervical/thoracic adjustments', 'Scapular stabilization and mobility drills', 'Ergonomic corrections (screen height, chair support)'] },
        { title: 'Exercises', items: ['Chin tucks, SNAGs (as advised), thoracic extension over foam roller', 'Scapular retraction/rows and wall angels'] }
      ]
    },
    {
      id: 'headache', label: 'Headaches & migraines', labelUr: 'سر درد اور مائیگرین', category: 'conditions' as QuickCategory, answer: 'Often linked to neck mechanics; precision care can reduce frequency/intensity with education and habits.', answerUr: 'اکثر گردن کی حرکات سے جڑا ہوتا ہے؛ درست نگہداشت سے تعدد اور شدت کم ہو سکتی ہے، ساتھ تعلیم اور عادات بہتر کرنا ضروری ہے۔', sections: [
        { title: 'Likely drivers', items: ['Cervicogenic (neck‑related) mechanics', 'Trigger points (suboccipital, upper traps)', 'Lifestyle triggers (sleep, hydration, stress)'] },
        { title: 'Treatment', items: ['Specific cervical/thoracic adjustments', 'Soft‑tissue release and postural retraining', 'Headache diary to identify triggers'] },
        { title: 'Self‑care', items: ['Hydration, regular meals, good sleep hygiene', 'Limit screen glare/eye strain', 'Breathing/relaxation drills'] }
      ]
    },
    { id: 'mid_back', label: 'Mid-back tightness', labelUr: 'درمیانی کمر میں کھچاؤ', category: 'conditions' as QuickCategory, answer: 'Thoracic mobility issues respond to specific adjustments and breathing/posture drills.', answerUr: 'تھوراسک موبلٹی مسائل مخصوص ایڈجسٹمنٹ اور سانس/پوسچر ڈرلز سے بہتر ہوتے ہیں۔' },
    { id: 'shoulder', label: 'Shoulder pain', labelUr: 'کندھے کا درد', category: 'conditions' as QuickCategory, answer: 'We assess neck, upper back, and shoulder mechanics; specific care + mobility work helps function.', answerUr: 'گردن، اپر بیک اور کندھے کی حرکات کا جائزہ لے کر مخصوص نگہداشت اور موبلٹی ورک سے فنکشن بہتر کیا جاتا ہے۔' },
    { id: 'knee', label: 'Knee pain', labelUr: 'گھٹنے کا درد', category: 'conditions' as QuickCategory, answer: 'Often linked to hip/ankle mechanics and posture; targeted correction + rehab can reduce pain.', answerUr: 'اکثر ہپ/اینکل کی حرکات اور پوسچر سے جڑا ہوتا ہے؛ ہدفی درستگی اور ریہیب سے درد کم ہو سکتا ہے۔' },
    {
      id: 'posture', label: 'Posture correction', labelUr: 'پوسچر کی درستگی', category: 'conditions' as QuickCategory, answer: 'Root‑cause correction plus ergonomics and habit coaching for upright, relaxed posture.', answerUr: 'بنیادی وجہ کی درستگی کے ساتھ ارگنومکس اور عادات کی کوچنگ سے سیدھا، آرام دہ پوسچر حاصل کیا جاتا ہے۔', sections: [
        { title: 'Why posture matters', items: ['Reduces joint stress and muscle fatigue', 'Improves breathing and energy', 'Supports long‑term spinal health'] },
        { title: 'Plan', items: ['Specific adjustments for stiff regions (e.g., thoracic)', 'Ergonomic setup: screen eye‑level, chair support, feet flat', 'Movement snacks every 45–60 minutes'] },
        { title: 'Exercises', items: ['Wall angels and thoracic extensions', 'Hip flexor/pec stretches', 'Scapular retraction, dead‑bug, and glute bridges'] }
      ]
    },
    { id: 'sports', label: 'Sports injuries', labelUr: 'اسپورٹس انجریز', category: 'conditions' as QuickCategory, answer: 'We manage overuse and acute strains with alignment, load management, and return‑to‑play guidance.', answerUr: 'اوور یوز اور اچانک کھچاؤ کے مسائل میں الائنمنٹ، لوڈ مینجمنٹ اور ریٹرن ٹو پلے گائیڈنس دی جاتی ہے۔' },
    { id: 'pinched_nerve', label: 'Pinched nerve', labelUr: 'نرو پِنچ (نرو دب جانا)', category: 'conditions' as QuickCategory, answer: 'Usually due to joint/disc mechanics; precise adjustments can reduce irritation and symptoms.', answerUr: 'عموماً جوائنٹ/ڈسک حرکات کی وجہ سے؛ مخصوص ایڈجسٹمنٹس سے جلن اور علامات میں کمی آتی ہے۔' },
    { id: 'tmj', label: 'Jaw (TMJ) tightness', labelUr: 'جبڑے (TMJ) میں کھچاؤ', category: 'conditions' as QuickCategory, answer: 'Neck and jaw mechanics interplay; gentle care + habit changes can ease discomfort.', answerUr: 'گردن اور جبڑے کی حرکات آپس میں مربوط ہیں؛ نرم نگہداشت اور عادات میں تبدیلی سے تکلیف کم ہو سکتی ہے۔' },
    {
      id: 'preg_back', label: 'Pregnancy back pain', labelUr: 'حمل کے دوران کمر درد', category: 'conditions' as QuickCategory, answer: 'Gentle, pregnancy‑safe care helps pelvic/low back alignment and comfort.', answerUr: 'حمل کے دوران محفوظ اور نرم نگہداشت سے پیلوک/لوئر بیک الائنمنٹ اور آرام میں اضافہ ہوتا ہے۔', sections: [
        { title: 'Contributors', items: ['Hormonal ligament laxity', 'Postural changes and load shift', 'Pelvic mechanics/SI joint strain'] },
        { title: 'Treatment', items: ['Gentle, pregnancy‑safe specific adjustments', 'Pelvic belts/support as advised', 'Sleep and lifting strategies'] },
        { title: 'Exercises', items: ['Walking, pelvic tilts, gentle cat‑camel', 'Glute and mid‑back activation drills (as tolerated)'] }
      ]
    },
    { id: 'post_surgery', label: 'After surgery care', labelUr: 'سرجری کے بعد نگہداشت', category: 'conditions' as QuickCategory, answer: 'Case‑by‑case with surgeon guidance; we focus on safe mobility, alignment, and function.', answerUr: 'سرجن کی ہدایات کے ساتھ کیس بہ کیس—محفوظ موبلٹی، الائنمنٹ اور فنکشن پر فوکس کیا جاتا ہے۔' },
    { id: 'numb_tingling', label: 'Numbness/tingling', labelUr: 'سن ہونا/جھنجھناہٹ', category: 'conditions' as QuickCategory, answer: 'May relate to nerve irritation from spinal mechanics; thorough assessment guides care or referral.', answerUr: 'اکثر اسپائنل حرکات سے نرو میں جلن کی وجہ؛ مکمل اسسمنٹ کے بعد صحیح نگہداشت یا ریفرل کیا جاتا ہے۔' },
    { id: 'desk', label: 'Desk job stiffness', labelUr: 'ڈیسک جاب کی اکڑاہٹ', category: 'conditions' as QuickCategory, answer: 'Ergonomics + micro‑breaks + specific care improve mobility and reduce pain.', answerUr: 'ارگنومکس، مختصر وقفے اور مخصوص نگہداشت سے موبلٹی بہتر اور درد کم ہوتا ہے۔' },
    { id: 'sleep', label: 'Best sleep position?', labelUr: 'بہترین سونے کی پوزیشن؟', category: 'conditions' as QuickCategory, answer: 'Side with pillow between knees or back with pillow under knees; keep neck neutral; avoid stomach sleeping.', answerUr: 'سائیڈ پر ٹانگوں کے درمیان تکیہ رکھ کر یا سیدھا لیٹ کر گھٹنوں کے نیچے تکیہ؛ گردن نیوٹرل رکھیں؛ الٹا سونے سے پرہیز کریں۔' },
    { id: 'mattress', label: 'What mattress is best?', labelUr: 'کون سا میٹریس بہتر ہے؟', category: 'conditions' as QuickCategory, answer: 'Medium‑firm fits most; aim for neutral spine. Prioritize comfort and support over brand hype.', answerUr: 'میڈیم-فرم زیادہ تر لوگوں کے لیے مناسب؛ مقصد نیوٹرل اسپائن رکھنا ہے—برانڈ سے زیادہ آرام اور سپورٹ کو ترجیح دیں۔' },
    { id: 'foot', label: 'Foot/ankle issues', labelUr: 'پاؤں/اینکل کے مسائل', category: 'conditions' as QuickCategory, answer: 'Foot mechanics affect knees/hips/back; we assess chain alignment and advise on footwear/rehab.', answerUr: 'پاؤں کی حرکات گھٹنے/ہپ/کمر کو متاثر کرتی ہیں؛ ہم پوری چین کا جائزہ لے کر جوتوں/ریہیب پر رہنمائی دیتے ہیں۔' },
    { id: 'lifting', label: 'Safe lifting tips', labelUr: 'وزن اٹھانے کے محفوظ طریقے', category: 'conditions' as QuickCategory, answer: 'Neutral spine, hinge at hips, keep load close, exhale on effort, avoid twisting while lifting.', answerUr: 'اسپائن نیوٹرل رکھیں، ہپس سے موڑیں، وزن جسم کے نزدیک رکھیں، زور لگاتے وقت سانس باہر نکالیں، وزن اٹھاتے وقت مڑنے سے بچیں۔' },
    { id: 'hydration', label: 'Hydration & spine', labelUr: 'پانی پینا اور اسپائن', category: 'conditions' as QuickCategory, answer: 'Staying hydrated supports discs and recovery; pair with protein, micronutrients, and sleep.', answerUr: 'پانی مناسب مقدار میں پینا ڈسکس اور ریکوری میں مدد دیتا ہے؛ پروٹین، مائیکرو نیوٹرینٹس اور نیند کے ساتھ متوازن رکھیں۔' },
    { id: 'stress', label: 'Stress and pain', labelUr: 'اسٹریس اور درد', category: 'conditions' as QuickCategory, answer: 'Stress sensitizes the nervous system; care + breathing, movement, and sleep hygiene help resilience.', answerUr: 'اسٹریس نروس سسٹم کو حساس بنا دیتا ہے؛ نگہداشت کے ساتھ سانس کی مشقیں، حرکت اور بہتر نیند مددگار ہیں۔' },

    // ADDITIONAL PRACTICAL FAQs
    {
      id: 'fees', label: 'Consultation fees/cost', labelUr: 'مشاورت کی فیس/لاگت', category: 'clinic' as QuickCategory, answer: 'Fees are shared at booking after a brief assessment, as they may vary by service type and complexity. We believe in transparent pricing with no hidden charges. Contact us directly for current fee schedule and any available packages.', answerUr: 'فیس کی تفصیل ایک مختصر اندازے کے بعد بکنگ پر بتائی جاتی ہے، کیونکہ یہ سروس کی قسم اور پیچیدگی کے مطابق مختلف ہو سکتی ہے۔ ہم شفاف قیمتوں پر یقین رکھتے ہیں بغیر کسی چھپی ہوئی چارجز کے۔ موجودہ فیس شیڈول اور دستیاب پیکجز کے لیے براہ راست ہم سے رابطہ کریں۔', sections: [
        { title: 'Notes', items: ['Transparent pricing after assessment', 'No hidden charges', 'Contact for current fee schedule', 'Package discounts may be available for multiple sessions'] }
      ]
    },
    {
      id: 'insurance', label: 'Do you accept insurance?', labelUr: 'کیا انشورنس قبول کی جاتی ہے؟', category: 'clinic' as QuickCategory, answer: 'Insurance coverage for chiropractic care varies significantly by policy and provider. While we do not directly bill insurance companies, we can provide you with a detailed receipt containing all necessary information for your insurance claim. Many patients successfully receive partial or full reimbursement when they submit this receipt to their insurance company.', answerUr: 'کائروپریکٹک کیئر کے لیے انشورنس کوریج پالیسی اور فراہم کنندہ کے لحاظ سے کافی مختلف ہوتی ہے۔ اگرچہ ہم براہ راست انشورنس کمپنیوں کو بل نہیں کرتے، ہم آپ کو ایک تفصیلی رسید فراہم کر سکتے ہیں جس میں آپ کے انشورنس کلیم کے لیے تمام ضروری معلومات ہوں گی۔ بہت سے مریض جب یہ رسید اپنی انشورنس کمپنی کو جمع کراتے ہیں تو کامیابی سے جزوی یا مکمل واپسی حاصل کرتے ہیں۔', sections: [
        { title: 'What we provide', items: ['Detailed receipt with diagnosis codes', 'Treatment records and session notes', 'All documentation needed for claims'] },
        { title: 'Your action', items: ['Call your insurer to verify chiropractic benefits', 'Ask about out-of-network reimbursement rates', 'Submit our receipt as per their process', 'Keep copies of all submissions'] }
      ]
    },
    {
      id: 'cancellation', label: 'Cancellation or late policy', labelUr: 'کینسلیشن یا تاخیر کی پالیسی', category: 'booking' as QuickCategory, answer: 'We understand that emergencies and unexpected situations arise. Please inform us as early as possible if you need to cancel or reschedule your appointment, ideally 24 hours in advance. This allows us to offer the slot to other patients in need. Repeated late cancellations or no-shows without notice may affect your ability to book preferred time slots in the future.', answerUr: 'ہم سمجھتے ہیں کہ ہنگامی حالات اور غیر متوقع صورتحال پیش آ سکتی ہے۔ براہ کرم ہمیں جلد از جلد مطلع کریں اگر آپ کو اپنی ملاقات منسوخ یا دوبارہ شیڈول کرنے کی ضرورت ہو، مثالی طور پر 24 گھنٹے پہلے۔ اس سے ہم اس سلاٹ کو ضرورت مند دوسرے مریضوں کو پیش کر سکتے ہیں۔ بار بار دیر سے منسوخی یا بغیر اطلاع کے حاضر نہ ہونا مستقبل میں آپ کی پسندیدہ وقت کے سلاٹس بک کرنے کی صلاحیت کو متاثر کر سکتا ہے۔', sections: [
        { title: 'Preferred notice', items: ['24 hours advance notice for cancellations', 'Call, WhatsApp, or message us immediately', 'We will help you reschedule at earliest convenience'] },
        { title: 'Why it matters', items: ['Helps other patients in pain access care', 'Keeps scheduling efficient and fair', 'Respects everyone\'s time', 'Maintains quality care for all'] }
      ]
    },
    {
      id: 'side_effects', label: 'Side effects or risks?', labelUr: 'کیا کوئی ضمنی اثرات یا خطرات ہیں؟', category: 'treatment' as QuickCategory, answer: 'Chiropractic adjustments are generally very safe when performed by a qualified practitioner. Mild, temporary soreness or fatigue can occur in 10-20% of patients, similar to what you might feel after starting a new exercise routine. This typically resolves within 24-48 hours. Serious adverse events are extremely rare. We conduct thorough screenings to identify any contraindications and proceed only when it is safe for your specific condition.', answerUr: 'کائروپریکٹک ایڈجسٹمنٹ عام طور پر بہت محفوظ ہوتی ہیں جب ایک قابل پریکٹیشنر کے ذریعے کی جائیں۔ ہلکی، عارضی خرابی یا تھکاوٹ 10-20% مریضوں میں ہو سکتی ہے، ویسے ہی جیسے آپ نئی ورزش کی روٹین شروع کرنے کے بعد محسوس کر سکتے ہیں۔ یہ عام طور پر 24-48 گھنٹوں میں ٹھیک ہو جاتا ہے۔ سنگین منفی واقعات انتہائی نایاب ہیں۔ ہم کسی بھی ممانعت کی شناخت کے لیے مکمل اسکریننگ کرتے ہیں اور صرف اسی وقت آگے بڑھتے ہیں جب یہ آپ کی مخصوص حالت کے لیے محفوظ ہو۔', sections: [
        { title: 'Common (temporary)', items: ['Light muscle soreness for 24–48 hours (like post-exercise)', 'Temporary fatigue as body adjusts', 'Mild warmth or tingling in treated area', 'Usually resolves with rest and hydration'] },
        { title: 'Very rare', items: ['Increased pain (stop and contact us)', 'Dizziness or headache (usually mild and brief)', 'Serious complications are extremely rare with proper screening'] },
        { title: 'When to contact us immediately', items: ['Pain escalates significantly beyond initial soreness', 'New neurological symptoms (numbness, weakness, vision changes)', 'Severe headache or dizziness', 'Any concerning changes'] }
      ]
    },
    {
      id: 'after_soreness', label: 'Is soreness normal after adjustment?', labelUr: 'ایڈجسٹمنٹ کے بعد خرابی معمول ہے؟', category: 'treatment' as QuickCategory, answer: 'Yes, mild soreness is common for 24–48 hours as tissues adapt. Use ice 10–15 minutes and stay hydrated.', sections: [
        { title: 'Self‑care', items: ['Ice 10–15 min (not heat early)', 'Gentle movement and hydration'] }
      ]
    },
    {
      id: 'heat_vs_ice', label: 'Heat or ice?', labelUr: 'گرمی یا برف؟', category: 'conditions' as QuickCategory, answer: 'For acute soreness or irritation, start with ice 10–15 minutes. Heat can be helpful later for muscle relaxation.', sections: [
        { title: 'Guidance', items: ['Ice for irritation or swelling', 'Heat later for stiffness (if comfortable)'] }
      ]
    },
    {
      id: 'desk_setup', label: 'Ergonomic desk setup tips', labelUr: 'ڈیسک سیٹ اپ ٹپس', category: 'conditions' as QuickCategory, answer: 'Set screen at eye‑level, use back support, keep feet flat, and take movement breaks every 45–60 minutes.', sections: [
        { title: 'Checklist', items: ['Screen eye‑level and arm’s length', 'Chair lumbar support; hips slightly above knees', 'Keyboard near elbows at ~90°', 'Feet flat or on a footrest', 'Move briefly every 45–60 minutes'] }
      ]
    },
    {
      id: 'timeline', label: 'When will I feel better?', labelUr: 'بہتری کب محسوس ہوگی؟', category: 'treatment' as QuickCategory, answer: 'Many feel relief within 1–3 visits, but timelines vary with condition severity and daily habits. We’ll set realistic goals together.', sections: [
        { title: 'What affects timing', items: ['Condition duration and severity', 'Sleep, stress, and activity levels', 'Exercise consistency'] }
      ]
    },
    {
      id: 'not_treated', label: 'What conditions do you not treat?', labelUr: 'کون سے کیسز ہم نہیں دیکھتے؟', category: 'clinic' as QuickCategory, answer: 'We refer out for conditions outside scope (e.g., fractures, infections, active neurological emergencies). Your safety is first.', sections: [
        { title: 'Examples', items: ['Suspected fracture or infection', 'Cauda equina signs', 'Unstable medical conditions'] }
      ]
    },
    {
      id: 'cracking', label: 'Do bones crack during adjustment?', labelUr: 'کیا ہڈی ٹوٹنے جیسی آواز آتی ہے؟', category: 'treatment' as QuickCategory, answer: 'The sound is a gas cavitation in the joint (like a pop), not bones breaking. Adjustments are controlled and specific.', sections: [
        { title: 'Reassurance', items: ['It’s a pressure change in joint fluid', 'Not required for an effective adjustment'] }
      ]
    },
    {
      id: 'exercise_freq', label: 'How often should I do the exercises?', labelUr: 'ورزش کتنی بار؟', category: 'treatment' as QuickCategory, answer: 'Short, frequent sessions (daily) are best initially; we adjust frequency as you progress.', sections: [
        { title: 'Plan', items: ['Daily micro‑sessions early', 'Progress intensity under guidance'] }
      ]
    },
    {
      id: 'booking_ahead', label: 'How far in advance should I book?', labelUr: 'کتنے دن پہلے بکنگ؟', category: 'booking' as QuickCategory, answer: 'For preferred times, book 2–5 days ahead; same‑day for acute cases is often possible if you call early.', sections: [
        { title: 'Tip', items: ['Morning calls improve chances for same‑day slots'] }
      ]
    },

    // ADDITIONAL ESSENTIAL FAQs with detailed sections
    {
      id: 'what_is_chiropractic', label: 'What is chiropractic care?', labelUr: 'کائروپریکٹک کیئر کیا ہے؟', category: 'treatment' as QuickCategory, answer: 'Chiropractic is a healthcare profession focused on diagnosing and treating musculoskeletal disorders, particularly of the spine. It emphasizes the body\'s natural healing ability through spinal adjustments and lifestyle guidance.', answerUr: 'کائروپریکٹک صحت کی دیکھ بھال کا ایک پیشہ ہے جو عضلاتی اور ہڈیوں کے مسائل، خاص طور پر ریڑھ کی ہڈی کی تشخیص اور علاج پر توجہ مرکوز کرتا ہے۔ یہ اسپائنل ایڈجسٹمنٹ اور طرز زندگی کی رہنمائی کے ذریعے جسم کی قدرتی شفا یابی کی صلاحیت پر زور دیتا ہے۔', sections: [
        { title: 'Core principles', items: ['Body has innate healing intelligence', 'Nervous system controls all body functions', 'Spinal health directly affects overall wellness', 'Focus on root causes, not just symptoms'] },
        { title: 'What chiropractors do', items: ['Comprehensive spinal and neurological assessments', 'Manual spinal adjustments to restore joint mobility', 'Soft tissue therapies and rehabilitation exercises', 'Ergonomic and lifestyle counseling for prevention'] },
        { title: 'Conditions commonly treated', items: ['Back and neck pain, headaches', 'Sciatica, herniated discs, joint problems', 'Sports injuries and posture issues', 'Work-related repetitive strain'] }
      ]
    },

    {
      id: 'dr_bashir_qualifications', label: 'Dr. Bashir\'s qualifications?', labelUr: 'ڈاکٹر بشیر کی قابلیت؟', category: 'clinic' as QuickCategory, answer: 'Dr. Bashir Khan is a Gonstead Certified Specialist Level V—the highest certification level in the Gonstead System. He combines advanced training, clinical expertise, and patient-centered care.', answerUr: 'ڈاکٹر بشیر خان گونسٹیڈ سرٹیفائیڈ اسپیشلسٹ لیول V ہیں—گونسٹیڈ سسٹم میں سب سے اعلیٰ سرٹیفیکیشن لیول۔ وہ جدید تربیت، کلینکل مہارت اور مریض پر مبنی کیئر کو یکجا کرتے ہیں۔', sections: [
        { title: 'Certifications', items: ['Gonstead Certified Specialist Level V', 'Doctor of Chiropractic (DC)', 'Advanced spinal biomechanics training', 'Continuous professional development in latest techniques'] },
        { title: 'Experience', items: ['Years of clinical practice in Pakistan', 'Treated diverse cases from acute to chronic conditions', 'Specialization in complex spinal disorders', 'Focus on evidence-based, patient-specific care'] },
        { title: 'Philosophy', items: ['Precision over guesswork—thorough analysis before adjustment', 'Education empowers patients for long-term health', 'Conservative care first, surgery only when truly necessary', 'Whole-person approach: physical, lifestyle, and wellness'] }
      ]
    },

    {
      id: 'difference_gonstead', label: 'How is Gonstead different?', labelUr: 'گونسٹیڈ کیسے مختلف ہے؟', category: 'treatment' as QuickCategory, answer: 'Gonstead stands apart with its rigorous analysis protocols. Instead of general spinal manipulation, we identify the exact problematic segment through multiple assessment methods before delivering a specific, controlled adjustment.', answerUr: 'گونسٹیڈ اپنے سخت تجزیاتی طریقہ کار سے ممتاز ہے۔ عام اسپائنل مینیپولیشن کی بجائے، ہم متعدد تشخیصی طریقوں کے ذریعے بالکل درست مسئلے والے حصے کی شناخت کرتے ہیں اور پھر ایک مخصوص، کنٹرولڈ ایڈجسٹمنٹ کرتے ہیں۔', sections: [
        { title: 'Five criteria of Gonstead analysis', items: ['Visualization: posture and gait assessment', 'Instrumentation: Nervoscope detects heat patterns (nerve inflammation)', 'Static palpation: feel for tissue texture, tone, temperature', 'Motion palpation: assess joint movement and restrictions', 'X-ray analysis: when clinically indicated for biomechanical insights'] },
        { title: 'Precision adjusting', items: ['Full-spine analysis but specific segment adjustment', 'Chair, table, or specific positioning for optimal biomechanics', 'Controlled force with proper contact, line of drive, and depth', 'Re-evaluation after adjustment to verify correction'] },
        { title: 'Long-term outcomes', items: ['Faster resolution with fewer visits (evidence-based)', 'Reduced risk of over-adjusting or missing the problem', 'Better patient understanding of their condition', 'Stability-focused: not dependency-based care'] }
      ]
    },

    {
      id: 'acute_vs_chronic', label: 'Acute vs chronic care approach?', labelUr: 'شدید بمقابلہ دائمی کیئر؟', category: 'treatment' as QuickCategory, answer: 'Acute care focuses on immediate pain relief and restoring function after recent injury. Chronic care addresses long-standing issues with corrective adjustments, rehabilitation, and lifestyle modifications for sustained improvement.', answerUr: 'شدید کیئر حالیہ چوٹ کے بعد فوری درد سے نجات اور فنکشن کی بحالی پر توجہ مرکوز کرتی ہے۔ دائمی کیئر میں طویل مدتی مسائل کو اصلاحی ایڈجسٹمنٹ، بحالی اور طرز زندگی میں تبدیلیوں کے ذریعے مستقل بہتری کے لیے حل کیا جاتا ہے۔', sections: [
        { title: 'Acute care (recent onset)', items: ['Goals: reduce inflammation, restore mobility, manage pain', 'Frequency: may require 2–3 visits per week initially', 'Duration: typically resolves in 2–6 weeks', 'Focus: specific adjustments, ice, activity modification, gentle movement'] },
        { title: 'Chronic care (long-standing)', items: ['Goals: correct underlying dysfunction, rebuild stability, prevent recurrence', 'Frequency: starts closer together, then tapered to maintenance', 'Duration: depends on severity—often 6–12 weeks for significant change', 'Focus: adjustments + targeted rehab exercises + ergonomic changes + habit retraining'] },
        { title: 'Maintenance/wellness care', items: ['After correction, periodic visits (monthly or as needed) maintain alignment', 'Prevent small issues from becoming big problems', 'Optimize performance and overall well-being', 'Optional but recommended for long-term spinal health'] }
      ]
    },

    {
      id: 'chiro_vs_physio', label: 'Chiropractic vs physiotherapy?', labelUr: 'کائروپریکٹک بمقابلہ فزیوتھراپی؟', category: 'treatment' as QuickCategory, answer: 'Chiropractic focuses on spinal alignment and nervous system function through precise adjustments. Physiotherapy emphasizes rehabilitation exercises and functional movement. Both can complement each other; we often provide exercises similar to physio as part of comprehensive care.', answerUr: 'کائروپریکٹک ریڑھ کی ہڈی کی صف بندی اور اعصابی نظام کے کام پر مرکوز ہے درست ایڈجسٹمنٹ کے ذریعے۔ فزیوتھراپی بحالی کی ورزشوں اور فعال حرکت پر زور دیتی ہے۔ دونوں ایک دوسرے کی تکمیل کر سکتے ہیں؛ ہم اکثر جامع کیئر کے حصے کے طور پر فزیو جیسی ورزشیں فراہم کرتے ہیں۔', sections: [
        { title: 'Chiropractic strengths', items: ['Precise spinal joint mobilization/manipulation', 'Neurological focus: nerve interference reduction', 'Rapid pain relief in many spinal conditions', 'Holistic assessment of spine and posture'] },
        { title: 'Physiotherapy strengths', items: ['Progressive muscle strengthening protocols', 'Post-surgical rehabilitation expertise', 'Modalities: ultrasound, TENS, electrical stimulation', 'Functional movement retraining'] },
        { title: 'Our integrated approach', items: ['Gonstead adjustments for biomechanical correction', 'Rehab exercises for stability and strength', 'Soft tissue work and ergonomic education', 'Collaborate with physios when specialized rehab needed'] }
      ]
    },

    {
      id: 'success_rate', label: 'What is your success rate?', labelUr: 'آپ کی کامیابی کی شرح؟', category: 'clinic' as QuickCategory, answer: 'Most patients experience significant improvement within 4–8 visits. Success depends on condition severity, adherence to care plan, and lifestyle factors. We set realistic expectations and adjust approach based on your progress.', answerUr: 'زیادہ تر مریض 4-8 وزٹس میں خاطر خواہ بہتری محسوس کرتے ہیں۔ کامیابی کا انحصار حالت کی شدت، کیئر پلان پر عمل اور طرز زندگی کے عوامل پر ہے۔ ہم حقیقت پسندانہ توقعات قائم کرتے ہیں اور آپ کی ترقی کی بنیاد پر نقطہ نظر کو ایڈجسٹ کرتے ہیں۔', sections: [
        { title: 'Typical outcomes', items: ['Acute conditions: 80–90% improvement in 2–6 weeks', 'Chronic conditions: 70–85% improvement in 8–16 weeks', 'Complex cases: individualized timelines; some require longer care', 'Maintenance care: ongoing wellness and prevention'] },
        { title: 'Factors affecting success', items: ['Your body\'s healing capacity and condition chronicity', 'Compliance with exercises and lifestyle modifications', 'Stress levels, sleep quality, nutrition', 'Work demands and ergonomic factors'] },
        { title: 'Our commitment', items: ['Honest assessment—if we can\'t help, we refer appropriately', 'Regular progress tracking and plan adjustments', 'Patient education for self-management', 'Collaborative care with other providers when needed'] }
      ]
    },

    {
      id: 'multiple_problems', label: 'Can you treat multiple problems?', labelUr: 'کیا آپ ایک ساتھ کئی مسائل کا علاج کر سکتے ہیں؟', category: 'treatment' as QuickCategory, answer: 'Yes. Many patients have several interconnected issues. We prioritize based on severity and functional impact, addressing the most critical problem first while considering how issues relate to each other in the kinetic chain.', answerUr: 'جی ہاں۔ بہت سے مریضوں کو کئی آپس میں جڑے ہوئے مسائل ہوتے ہیں۔ ہم شدت اور فعال اثر کی بنیاد پر ترجیح دیتے ہیں، سب سے اہم مسئلے کو پہلے حل کرتے ہوئے یہ غور کرتے ہیں کہ مسائل kinetic chain میں ایک دوسرے سے کیسے متعلق ہیں۔', sections: [
        { title: 'Common combinations', items: ['Low back pain + sciatica + hip dysfunction', 'Neck pain + headaches + shoulder tightness', 'Mid-back stiffness + rib discomfort + breathing restrictions', 'Posture issues affecting multiple regions'] },
        { title: 'Treatment strategy', items: ['Primary problem: address most limiting or painful issue first', 'Secondary issues: often improve as primary resolves due to interconnection', 'Sequential care: tackle additional problems as capacity allows', 'Holistic view: consider lifestyle factors affecting all regions'] },
        { title: 'Time and prioritization', items: ['Session focuses on 1–2 main areas for precision', 'Avoid over-treating in single visit (body needs recovery time)', 'Phased approach yields better long-term results', 'You\'re always involved in prioritization decisions'] }
      ]
    },

    {
      id: 'lifestyle_advice', label: 'Do you give lifestyle advice?', labelUr: 'کیا آپ طرز زندگی کے بارے میں مشورہ دیتے ہیں؟', category: 'treatment' as QuickCategory, answer: 'Absolutely. Adjustments provide relief, but lasting results require lifestyle optimization. We offer guidance on ergonomics, sleep, nutrition, stress management, and movement habits tailored to your situation.', answerUr: 'بالکل۔ ایڈجسٹمنٹ سے آرام ملتا ہے، لیکن دیرپا نتائج کے لیے طرز زندگی کو بہتر بنانا ضروری ہے۔ ہم آپ کی صورتحال کے مطابق ergonomics، نیند، غذائیت، تناؤ کے انتظام اور حرکت کی عادات پر رہنمائی فراہم کرتے ہیں۔', sections: [
        { title: 'Ergonomics', items: ['Workstation setup: screen height, chair support, keyboard/mouse position', 'Proper lifting technique and body mechanics', 'Sleep surface and pillow selection', 'Driving posture and car seat adjustments'] },
        { title: 'Movement & exercise', items: ['Daily movement snacks to counteract sitting', 'Specific strengthening and mobility routines', 'Sport-specific conditioning guidance', 'Walking, stretching, and active recovery strategies'] },
        { title: 'Nutrition & hydration', items: ['Anti-inflammatory foods to support healing', 'Adequate protein for tissue repair', 'Hydration for disc health and recovery', 'Weight management when relevant to spinal load'] },
        { title: 'Stress & sleep', items: ['Sleep hygiene for restorative rest', 'Breathing exercises for nervous system regulation', 'Stress management techniques', 'Mind-body connection in pain perception'] }
      ]
    },

    {
      id: 'pain_free_adjustment', label: 'I have no pain. Should I still come?', labelUr: 'مجھے درد نہیں ہے۔ کیا پھر بھی آنا چاہیے؟', category: 'treatment' as QuickCategory, answer: 'Not necessarily. Chiropractic isn\'t just for pain. Wellness care can maintain spinal health, optimize function, and prevent problems. However, it\'s optional—come if you value proactive health, not because you feel obligated.', answerUr: 'ضروری نہیں۔ کائروپریکٹک صرف درد کے لیے نہیں ہے۔ wellness کیئر ریڑھ کی ہڈی کی صحت کو برقرار رکھ سکتی ہے، فنکشن کو بہتر بنا سکتی ہے اور مسائل کو روک سکتی ہے۔ تاہم، یہ اختیاری ہے—اگر آپ فعال صحت کی قدر کرتے ہیں تو آئیں، نہ کہ اس لیے کہ آپ مجبور محسوس کرتے ہیں۔', sections: [
        { title: 'Wellness care benefits', items: ['Maintain spinal mobility and alignment', 'Catch small issues before they become painful', 'Optimize nervous system function', 'Support active lifestyle and performance'] },
        { title: 'When it makes sense', items: ['High physical demands (manual labor, athletics)', 'History of recurrent problems', 'Want to stay proactive with health', 'Notice early signs of stiffness or dysfunction'] },
        { title: 'When it may not', items: ['No history of problems and very active', 'Budget or time constraints', 'Prefer reactive care only when symptomatic', 'Other health priorities take precedence'] },
        { title: 'Our stance', items: ['No pressure for wellness care', 'We educate; you decide', 'Typically monthly to quarterly if pursued', 'Always goal-oriented, never dependency-based'] }
      ]
    },

    {
      id: 'bring_someone', label: 'Can I bring a family member/friend?', labelUr: 'کیا میں اپنے ساتھ کسی کو لا سکتا ہوں؟', category: 'booking' as QuickCategory, answer: 'Yes, one support person is welcome. It can be helpful for moral support, understanding your care plan, or assisting with exercises. For privacy during examination, let us know your preference.', answerUr: 'جی ہاں، ایک معاون شخص کا خیرمقدم ہے۔ یہ حوصلہ افزائی، آپ کے کیئر پلان کو سمجھنے، یا ورزشوں میں مدد کے لیے مددگار ہو سکتا ہے۔ معائنے کے دوران پرائیویسی کے لیے، ہمیں اپنی ترجیح بتائیں۔', sections: [
        { title: 'Benefits of companion', items: ['Emotional support, especially for first visit or anxiety', 'Help remember post-visit instructions', 'Assist with translation if language barrier', 'Second perspective on condition and care plan'] },
        { title: 'Considerations', items: ['One person max to maintain focus', 'Children: if bringing kids, ensure they\'re supervised', 'Confidentiality: only with your consent will we discuss details', 'Examination privacy: companion may step out briefly if preferred'] }
      ]
    },

    {
      id: 'what_to_wear', label: 'What should I wear to my appointment?', labelUr: 'اپائنٹمنٹ پر کیا پہنوں؟', category: 'booking' as QuickCategory, answer: 'Wear comfortable, loose-fitting clothing that allows movement. Athletic wear or casual clothes work well. Avoid tight jeans, belts, or restrictive garments. You may be asked to remove shoes and outer layers for examination.', answerUr: 'آرام دہ، ڈھیلے کپڑے پہنیں جو حرکت کی اجازت دیں۔ کھیلوں کے لباس یا casual کپڑے اچھے ہیں۔ تنگ jeans، بیلٹ یا تنگ لباس سے پرہیز کریں۔ آپ سے معائنے کے لیے جوتے اور اوپری layers اتارنے کو کہا جا سکتا ہے۔', sections: [
        { title: 'Good choices', items: ['Athletic wear: joggers, yoga pants, t-shirts', 'Loose-fitting casual clothes', 'Women: sports bra or supportive undergarments', 'Men: comfortable shorts or loose pants'] },
        { title: 'Avoid', items: ['Tight jeans or restrictive pants', 'Dresses or skirts (unless wearing leggings underneath)', 'Heavy jewelry or accessories', 'Thick belts or bulky items in pockets'] },
        { title: 'What happens', items: ['You\'ll remain clothed throughout', 'May remove shoes, jacket, or outer shirt for examination', 'Posture and movement assessment require visibility', 'Modest draping/gowns available if clothing is too restrictive'] }
      ]
    },

    {
      id: 'age_limits', label: 'Is there an age limit?', labelUr: 'کیا عمر کی کوئی حد ہے؟', category: 'treatment' as QuickCategory, answer: 'No strict age limit. We treat infants to seniors with age-appropriate techniques. Pediatric adjustments are extremely gentle; geriatric care is modified for bone density and mobility. Safety and comfort are always prioritized.', answerUr: 'کوئی سخت عمر کی حد نہیں۔ ہم عمر کے مطابق تکنیکوں کے ساتھ بچوں سے بزرگوں تک کا علاج کرتے ہیں۔ بچوں کی ایڈجسٹمنٹ انتہائی نرم ہوتی ہے; بزرگوں کی کیئر ہڑیوں کی کثافت اور mobility کے لیے modified ہوتی ہے۔ حفاظت اور آرام ہمیشہ ترجیح ہے۔', sections: [
        { title: 'Infants & toddlers (0–3 yrs)', titleUr: 'نوزائیدہ اور چھوٹے بچے (0-3 سال)', items: ['Fingertip pressure only—very gentle mobilization', 'Common: colic, torticollis, feeding difficulties, developmental delays', 'Parent education on positioning and handling', 'Short sessions; often resolves quickly'], itemsUr: ['صرف انگلیوں کا دباؤ—بہت نرم حرکت', 'عام: کولک، ٹورٹی کولس، کھانے میں مشکل، نشونما میں تاخیر', 'والدین کو پوزیشننگ اور ہینڈلنگ کی تعلیم', 'مختصر سیشنز؛ اکثر جلدی ٹھیک ہو جاتے ہیں'] },
        { title: 'Children & teens (4–18 yrs)', titleUr: 'بچے اور نوجوان (4-18 سال)', items: ['Modified techniques scaled to body size', 'Common: sports injuries, growing pains, scoliosis screening, posture', 'Education on backpack use and screen time ergonomics', 'Builds foundation for lifelong spinal health'], itemsUr: ['جسم کے سائز کے مطابق تبدیل کردہ تکنیکیں', 'عام: کھیلوں کی چوٹیں، بڑھوتری کا درد، اسکولیوسس کی جانچ، پوسچر', 'بیک پیک کے استعمال اور اسکرین ٹائم کی ارگنومکس پر تعلیم', 'پوری زندگی کی ریڑھ کی ہڈی کی صحت کی بنیاد'] },
        { title: 'Adults (19–64 yrs)', titleUr: 'بالغ (19-64 سال)', items: ['Full range of techniques available', 'Work-related, sport, degenerative, or acute injuries', 'Peak demand age group', 'Emphasis on prevention and performance optimization'], itemsUr: ['تمام تکنیکیں دستیاب', 'کام سے متعلق، کھیلوں، خراب یا تیز چوٹیں', 'سب سے زیادہ مانگ والا عمر گروپ', 'روک تھام اور کارکردگی کی بہتری پر زور'] },
        { title: 'Seniors (65+)', titleUr: 'بزرگ (65+ سال)', items: ['Gentle, low-force techniques adapted for osteoporosis/arthritis', 'Focus on mobility, balance, fall prevention', 'Common: degenerative changes, stiffness, nerve compression', 'Collaborative care with physicians for complex medical histories'], itemsUr: ['نرم، کم طاقت کی تکنیکیں آسٹیو پورسس/آرتھرائٹس کے لیے', 'موبلٹی، توازن، گرنے سے بچاؤ پر فوکس', 'عام: خراب ہونے والی تبدیلیاں، سختی، نرو میں دباؤ', 'معقدہ میڈیکل ہسٹری والے معالجین کے ساتھ تعاون'] }
      ]
    },

    // NEW CRITICAL FAQs
    {
      id: 'what_expect_first_visit', label: 'What should I expect during my first appointment?', labelUr: 'پہلی ملاقات میں مجھے کیا توقع کرنی چاہیے؟', category: 'treatment' as QuickCategory, answer: 'Your first visit is comprehensive and typically lasts 45-90 minutes. We begin with a detailed health history to understand your condition, lifestyle, and goals. Next, we perform a thorough spinal examination including posture assessment, motion testing, and palpation. If indicated, we may take X-rays to rule out serious conditions and guide our analysis. Finally, we explain our findings in detail, discuss treatment options, and if appropriate, perform your first adjustment. We ensure you fully understand your condition before proceeding.', answerUr: 'آپ کی پہلی ملاقات جامع ہوتی ہے اور عام طور پر 45-90 منٹ تک رہتی ہے۔ ہم آپ کی حالت، طرز زندگی، اور اہداف کو سمجھنے کے لیے تفصیلی صحت کی ہسٹری سے شروع کرتے ہیں۔ اگلا، ہم مکمل اسپائنل معائنہ کرتے ہیں جس میں پوسچر اسسمنٹ، موشن ٹیسٹنگ، اور لمس شامل ہے۔ اگر ضروری ہو تو ہم ایکس رے لے سکتے ہیں سنگین حالات سے بچنے اور ہماری تجزیہ میں مدد دینے کے لیے۔ آخر میں، ہم اپنے نتائج کی تفصیل سے وضاحت کرتے ہیں، علاج کے اختیارات پر بحث کرتے ہیں، اور اگر مناسب ہو تو آپ کی پہلی ایڈجسٹمنٹ کرتے ہیں۔', sections: [
        { title: 'Timeline of Your Visit', titleUr: 'آپ کی ملاقات کا شیڈول', items: ['First 10-15 min: Welcome, intake forms, health history questions', 'Next 15-20 min: Physical exam (posture, motion, palpation)', '5-10 min: X-rays if needed (quick and safe—minimal radiation)', '10-15 min: Analysis and explanation of findings', '5-10 min: Discussion of treatment plan and recommendations', '10-15 min: First adjustment (if appropriate)', 'Final 5 min: Post-visit instructions and next appointment scheduling'], itemsUr: ['پہلے 10-15 منٹ: خیرمقدم، فارمز بھرنا، صحت کی ہسٹری کے سوالات', 'اگلے 15-20 منٹ: جسمانی معائنہ (پوسچر، حرکت، لمس)', '5-10 منٹ: ایکس رے اگر ضروری ہو (تیز اور محفوظ—کم تابکاری)', '10-15 منٹ: نتائج کا تجزیہ اور وضاحت', '5-10 منٹ: علاج کے منصوبے اور تجاویز پر بحث', '10-15 منٹ: پہلی ایڈجسٹمنٹ (اگر مناسب ہو)', 'آخری 5 منٹ: وزٹ کے بعد کی ہدایات اور اگلی ملاقات کا شیڈول'] },
        { title: 'What to Bring', titleUr: 'کیا ساتھ لائیں', items: ['Photo ID or valid government-issued identification', 'Insurance card (if you have coverage)', 'List of current medications and supplements', 'Any prior imaging reports (X-rays, MRI, CT scans)', 'Referral letter if applicable', 'Emergency contact information'], itemsUr: ['فوٹو ID یا درست حکومتی شناخت', 'انشورنس کارڈ (اگر آپ کے پاس کوریج ہے)', 'موجودہ ادویات اور سپلیمنٹس کی فہرست', 'کوئی بھی پرانی imaging رپورٹس (ایکس رے، MRI، سی ٹی اسکین)', 'ریفرل لیٹر اگر قابل اطلاق ہو', 'ایمرجنسی رابطے کی معلومات'] },
        { title: 'How You\'ll Feel After', titleUr: 'اس کے بعد آپ کیسا محسوس کریں گے', items: ['Most patients feel immediate relief or lightness', 'Mild soreness (like post-workout) may develop over next 24 hours', 'Improved mobility and range of motion', 'Some patients report better sleep that night', 'Energy levels may increase as body rebalances'], itemsUr: ['زیادہ تر مریضوں کو فوری آرام یا ہلکاپن محسوس ہوتا ہے', 'ہلکی سی خرابی (ورزش کے بعد کی طرح) اگلے 24 گھنٹوں میں ہو سکتی ہے', 'حرکت میں بہتری اور رفتار میں اضافہ', 'کچھ مریضوں کو اس رات بہتر نیند آتی ہے', 'توانائی کی سطح بڑھ سکتی ہے جیسے جسم دوبارہ توازن میں آتا ہے'] }
      ]
    },

    {
      id: 'technology_equipment', label: 'What technology and equipment do you use?', labelUr: 'آپ کون سی ٹیکنالوجی اور سامان استعمال کرتے ہیں؟', category: 'clinic' as QuickCategory, answer: 'We use state-of-the-art Gonstead-specific equipment combined with modern technology. Our Nervoscope detects areas of nerve irritation through heat sensitivity—revealing subluxations that other methods might miss. We have specialized Gonstead tables that position you optimally for each adjustment. Digital X-ray technology provides clear imaging with minimal radiation exposure. All equipment is regularly maintained, calibrated, and meets international safety standards. This combination ensures precise diagnosis and safe, effective treatment.', answerUr: 'ہم جدید ٹیکنالوجی کے ساتھ ملا کر گونسٹیڈ کے لیے خصوصی سامان استعمال کرتے ہیں۔ ہمارا نرو سکوپ حرارت کی حساسیت کے ذریعے نرو میں جلن والے حصوں کو ظاہر کرتا ہے۔ ہمارے پاس خصوصی گونسٹیڈ ٹیبلز ہیں جو آپ کو ہر ایڈجسٹمنٹ کے لیے بہترین طریقے سے رکھتے ہیں۔ ڈیجیٹل ایکس رے ٹیکنالوجی کم تابکاری کے ساتھ واضح امیجنگ فراہم کرتی ہے۔', sections: [
        { title: 'Our Key Equipment', titleUr: 'ہمارا اہم سامان', items: ['Nervoscope: Thermal imaging to detect nerve interference areas', 'Gonstead Treatment Table: Specialized table with drop-sections for specific adjustments', 'Digital X-ray Machine: Low-radiation, high-resolution imaging', 'Percussion Instruments: For precise percussion adjustments', 'Assessment Tools: Digital inclinometers for measuring spinal motion', 'Ergonomic Patient Seating: For comfortable assessment and treatment'], itemsUr: ['نرو سکوپ: نرو میں مداخلت کو دیکھنے کے لیے تھرمل امیجنگ', 'گونسٹیڈ ٹریٹمنٹ ٹیبل: خصوصی ٹیبل مخصوص ایڈجسٹمنٹ کے لیے', 'ڈیجیٹل ایکس رے مشین: کم تابکاری، اعلیٰ معیار کی امیجنگ', 'پرکشن آلات: مخصوص percussion ایڈجسٹمنٹ کے لیے', 'اسسمنٹ ٹولز: اسپائنل موشن کو ماپنے کے لیے ڈیجیٹل inclinometers', 'آرام دہ مریض کی سیٹنگ: آرام دہ اسسمنٹ اور علاج کے لیے'] },
        { title: 'Safety & Maintenance', titleUr: 'حفاظت اور دیکھ بھال', items: ['All equipment regularly serviced and calibrated', 'Digital X-rays use <1% of radiation from standard X-rays', 'Needless system and contact points sterilized between patients', 'Equipment meets international safety standards and certifications', 'Staff trained on proper equipment use and safety protocols'], itemsUr: ['تمام سامان باقاعدگی سے سروس اور کیلیبریٹ کیا جاتا ہے', 'ڈیجیٹل ایکس رے معیاری ایکس رے سے <1% تابکاری استعمال کرتے ہیں', 'نیڈللیس سسٹم اور رابطہ نکات مریضوں کے درمیان معقم کیے جاتے ہیں', 'سامان بین الاقوامی حفاظت کے معیارات اور سرٹیفیکیشن سے ملتا ہے', 'عملہ صحیح سامان کے استعمال اور حفاظت کے پروٹوکول پر تربیت یافتہ ہے'] }
      ]
    },

    {
      id: 'emergency_response', label: 'What if I have an acute emergency or severe pain?', labelUr: 'اگر مجھے اچانک ایمرجنسی یا شدید درد ہو تو کیا ہوگا؟', category: 'clinic' as QuickCategory, answer: 'We prioritize emergency cases and can usually accommodate acute pain patients the same day. Call us immediately at +92 304 699 6267 (available during clinic hours and for true emergencies). If you experience red flag symptoms like sudden weakness, loss of bowel/bladder control, or severe neurological changes, seek emergency hospital care immediately—do not wait for our clinic. For acute but non-emergency pain, we can often fit you in within hours. Our emergency protocol ensures rapid assessment and pain management. We also coordinate with nearby hospitals and specialists if advanced care is needed.', answerUr: 'ہم ایمرجنسی کیسز کو ترجیح دیتے ہیں اور عام طور پر تیز درد والے مریضوں کو اسی دن سنبھال سکتے ہیں۔ فوری کال کریں +92 304 699 6267۔ اگر آپ کو اچانک کمزوری، bowel/bladder کنٹرول میں مسائل، یا شدید neurological تبدیلیوں جیسی خطرے کی علامات ہوں تو فوری ہسپتال میں جائیں۔ تیز لیکن غیر ایمرجنسی درد کے لیے، ہم عام طور پر گھنٹوں میں فٹ ہو سکتے ہیں۔', sections: [
        { title: 'Red Flag Symptoms (Seek ER Immediately)', titleUr: 'خطرناک علامات (فوری ER میں جائیں)', items: ['Sudden severe weakness in legs or arms', 'Loss of bowel or bladder control', 'Sudden numbness in genital/groin area (saddle anesthesia)', 'Unexplained fever with severe back pain', 'Inability to control limbs or sudden paralysis', 'Severe headache with neck stiffness', 'Signs of infection (fever, swelling, warmth)'], itemsUr: ['ٹانگوں یا بازوؤں میں اچانک شدید کمزوری', 'Bowel یا bladder کنٹرول میں مسائل', 'genitals/groin میں اچانک سن ہونا', 'غیر معروف بخار شدید کمر درد کے ساتھ', 'اعضاء کو کنٹرول کرنے میں ناکامی یا اچانک فالج', 'شدید سر درد گردن کی سختی کے ساتھ', 'انفیکشن کی علامات (بخار، سوجش، گرمی)'] },
        { title: 'Acute But Non-Emergency (Call Us)', titleUr: 'تیز لیکن غیر ایمرجنسی (ہمیں کال کریں)', items: ['Sudden severe back or neck pain', 'Unable to move or turn without significant pain', 'Acute sports injury or trauma', 'Unbearable pain despite home remedies', 'Sudden onset of sciatica or nerve pain', 'Recent accident or fall with pain'], itemsUr: ['اچانک شدید کمر یا گردن کا درد', 'بغیر اہم درد کے حرکت کرنے میں ناکام', 'تیز کھیل کی چوٹ یا صدمہ', 'گھریلو علاج کے باوجود ناقابل برداشت درد', 'Sciatica یا نرو درد کا اچانک آغاز', 'حالیہ حادثہ یا گرنا درد کے ساتھ'] },
        { title: 'Our Emergency Response', titleUr: 'ہمارا ایمرجنسی ردعمل', items: ['Priority phone line for acute cases', 'Same-day appointments usually available for emergencies', 'Rapid initial assessment (often within 30-60 minutes)', 'Immediate pain management strategies', 'Coordination with hospitals if needed', 'After-hours contact options for true emergencies'], itemsUr: ['ایمرجنسی کیسز کے لیے ترجیح والی فون لائن', 'ایمرجنسی کے لیے عام طور پر اسی دن ملاقات دستیاب', 'تیز ابتدائی اسسمنٹ (اکثر 30-60 منٹ میں)', 'فوری درد کے انتظام کی حکمت عملی', 'ضرورت ہو تو ہسپتالوں کے ساتھ تعاون', 'حقیقی ایمرجنسی کے لیے وقت سے بعد کے رابطے کی تدبیریں'] }
      ]
    },

    {
      id: 'realistic_timeline', label: 'What is a realistic recovery timeline?', labelUr: 'بحالی کا حقیقی شیڈول کیا ہے؟', category: 'treatment' as QuickCategory, answer: 'Recovery timelines vary widely based on your condition, how long you\'ve had it, your age, lifestyle, and treatment compliance. Some patients experience immediate relief within the first visit, while others need 4-8 weeks for significant improvement. Acute conditions (recent injuries) typically respond faster than chronic ones. We\'ll establish realistic expectations during your initial consultation and track progress regularly. Recovery isn\'t linear—you may notice fluctuations, but overall trends should show improvement. Consistent home exercises and lifestyle changes dramatically speed recovery and prevent relapse.', answerUr: 'بحالی کے ٹائم لائن آپ کی حالت، اس کی مدت، عمر، طرز زندگی، اور علاج کی تعریف پر منحصر ہیں۔ کچھ مریضوں کو پہلی وزٹ میں فوری آرام ملتا ہے، دوسروں کو خاطر خواہ بہتری کے لیے 4-8 ہفتے لگتے ہیں۔', sections: [
        { title: 'Typical Recovery Timelines', titleUr: 'عام بحالی کے شیڈول', items: ['Acute injuries (recent)\n— 2-6 weeks for significant improvement\n— May feel relief after 1-3 visits', 'Chronic pain (long-standing)\n— 8-16 weeks for noticeable change\n— Initial improvement often seen by week 2-4', 'Very chronic/complex cases\n— May take 12+ weeks\n— Progress tracked through regular reassessments', 'Maintenance phase\n— After initial recovery, monthly visits prevent relapse\n— Ongoing exercises and lifestyle habits crucial'], itemsUr: ['تیز چوٹیں (حالیہ)\n— خاطر خواہ بہتری کے لیے 2-6 ہفتے\n— 1-3 وزٹس کے بعد آرام محسوس ہو سکتا ہے', 'دائمی درد (طویل مدتی)\n— نمایاں تبدیلی کے لیے 8-16 ہفتے\n— ابتدائی بہتری اکثر ہفتہ 2-4 میں دیکھی جاتی ہے', 'بہت دائمی/پیچیدہ کیسز\n— 12+ ہفتے لگ سکتے ہیں\n— باقاعدہ دوبارہ اسسمنٹ کے ذریعے ترقی\n— نگران مرحلہ مکمل ہونے کے بعد'] },
        { title: 'Factors That Speed Recovery', titleUr: 'بحالی کو تیز کرنے والے عوامل', items: ['Compliance with prescribed exercises (critical!)', 'Making recommended ergonomic and lifestyle changes', 'Staying hydrated and getting adequate sleep', 'Managing stress levels', 'Avoiding re-injury (proper body mechanics)', 'Following dietary recommendations'], itemsUr: ['تجویز کردہ ورزشوں کی تعریف (اہم!)', 'تجویز کردہ ارگنومک اور طرز زندگی میں تبدیلی', 'مناسب ہائیڈریشن اور نیند', 'تناؤ کی سطح کو منظم کرنا', 'دوبارہ چوٹ سے بچنا (صحیح جسمانی میکانکس)', 'غذا کی تجاویز پر عمل'] },
        { title: 'Factors That Slow Recovery', titleUr: 'بحالی کو سست کرنے والے عوامل', items: ['Not doing exercises at home', 'Poor posture habits despite advice', 'Continued high stress without management', 'Inadequate sleep or rest', 'Re-injuring yourself with improper movement', 'Smoking or poor diet/hydration'], itemsUr: ['گھر میں ورزشیں نہ کرنا', 'مشورے کے باوجود خراب پوسچر کی عادات', 'منظم ہوئے بغیر شدید تناؤ', 'ناکافی نیند یا آرام', 'غلط حرکت کے ذریعے خود کو دوبارہ چوٹ', 'سگریٹ نوشی یا خراب خوراک/ہائیڈریشن'] }
      ]
    },

    // NEW CLINIC-SPECIFIC FAQs
    {
      id: 'clinic_hours_detailed', label: 'What are your exact clinic hours?', labelUr: 'کلینک کے عین اوقات کیا ہیں؟', category: 'clinic' as QuickCategory, answer: 'Our clinic is open Monday through Saturday from 9:00 AM to 6:00 PM. We are closed on Sundays for regular appointments. However, emergency care is available any day including Sundays—just call +92 304 699 6267 for urgent cases. We recommend calling ahead even during regular hours to ensure the doctor is available and to minimize wait times. Peak hours are typically 10 AM-12 PM and 3 PM-5 PM, so if you prefer less waiting, consider early morning (9 AM) or late afternoon (5-6 PM) appointments.', answerUr: 'ہمارا کلینک پیر سے ہفتہ تک صبح 9:00 سے شام 6:00 بجے تک کھلا رہتا ہے۔ اتوار کو باقاعدہ ملاقاتوں کے لیے بند رہتا ہے۔ تاہم، ایمرجنسی کیئر ہر دن دستیاب ہے بشمول اتوار—صرف +92 304 699 6267 پر فوری کیسز کے لیے کال کریں۔ ہم تجویز کرتے ہیں کہ باقاعدہ اوقات میں بھی پہلے سے کال کریں تاکہ ڈاکٹر کی دستیابی یقینی بنائی جا سکے اور انتظار کا وقت کم ہو۔', sections: [
        { title: 'Regular Hours', titleUr: 'باقاعدہ اوقات', items: ['Monday to Saturday: 9:00 AM - 6:00 PM', 'Sunday: Closed for regular appointments', 'Last appointment booking: 5:30 PM', 'Clinic phone available during these hours'], itemsUr: ['پیر سے ہفتہ: صبح 9:00 - شام 6:00', 'اتوار: باقاعدہ ملاقاتوں کے لیے بند', 'آخری ملاقات کی بکنگ: 5:30 شام', 'ان اوقات میں کلینک فون دستیاب ہے'] },
        { title: 'Emergency Care', titleUr: 'ایمرجنسی کیئر', items: ['Available 7 days a week including Sundays', 'Call +92 304 699 6267 for emergencies', 'Acute pain cases prioritized same-day', 'True emergencies accommodated after hours'], itemsUr: ['ہفتے کے 7 دن دستیاب بشمول اتوار', 'ایمرجنسی کے لیے +92 304 699 6267 پر کال کریں', 'شدید درد کیسز کو اسی دن ترجیح', 'حقیقی ایمرجنسی کو اوقات کے بعد بھی دیکھا جاتا ہے'] },
        { title: 'Best Times to Visit', titleUr: 'بہترین وقت', items: ['Less busy: 9:00-10:00 AM or 5:00-6:00 PM', 'Peak hours: 10:00 AM-12:00 PM and 3:00-5:00 PM', 'Call ahead to check current wait times', 'First-time patients: allow extra time (45-90 min)'], itemsUr: ['کم مصروف: صبح 9:00-10:00 یا شام 5:00-6:00', 'مصروف اوقات: 10:00 صبح-12:00 دوپہر اور 3:00-5:00 شام', 'موجودہ انتظار کے وقت کی جانچ کے لیے پہلے کال کریں', 'پہلی بار مریض: اضافی وقت رکھیں (45-90 منٹ)'] }
      ]
    },

    {
      id: 'sunday_policy', label: 'Why are you closed on Sundays?', labelUr: 'اتوار کو کیوں بند رہتے ہیں؟', category: 'clinic' as QuickCategory, answer: 'Sundays are reserved for rest and family time to ensure Dr. Bashir Khan stays refreshed and provides the highest quality care during the week. However, we understand that emergencies don\'t follow a schedule. For genuine emergency cases with acute, severe pain, we are available on Sundays. Please call +92 304 699 6267, and we will assess your situation. Non-emergency cases will be scheduled for Monday or the next available day during regular hours.', answerUr: 'اتوار آرام اور خاندانی وقت کے لیے محفوظ ہے تاکہ ڈاکٹر بشیر خان تازہ دم رہیں اور ہفتے کے دوران اعلیٰ معیار کی دیکھ بھال فراہم کریں۔ تاہم، ہم سمجھتے ہیں کہ ایمرجنسی شیڈول پر نہیں چلتی۔ حقیقی ایمرجنسی کیسز کے لیے جن میں شدید درد ہو، ہم اتوار کو دستیاب ہیں۔ براہ کرم +92 304 699 6267 پر کال کریں۔', sections: [
        { title: 'Our Policy', titleUr: 'ہماری پالیسی', items: ['Sundays: Rest day for quality care maintenance', 'Emergency exceptions: Severe acute pain cases', 'Assessment via phone first', 'Non-emergencies scheduled for next working day'], itemsUr: ['اتوار: معیاری دیکھ بھال کے لیے آرام کا دن', 'ایمرجنسی استثناء: شدید تیز درد کیسز', 'پہلے فون کے ذریعے اندازہ', 'غیر ایمرجنسی اگلے کام کے دن کے لیے شیڈول'] },
        { title: 'What Qualifies as Sunday Emergency', titleUr: 'اتوار کی ایمرجنسی کیا ہے', items: ['Sudden severe back/neck pain that prevents movement', 'Acute sciatica with unbearable pain', 'Recent injury/accident with significant pain', 'Severe headache with neurological symptoms', 'Any condition causing extreme distress'], itemsUr: ['اچانک شدید کمر/گردن کا درد جو حرکت روک دے', 'ناقابل برداشت درد کے ساتھ تیز sciatica', 'حالیہ چوٹ/حادثہ اہم درد کے ساتھ', 'neurological علامات کے ساتھ شدید سر درد', 'کوئی بھی حالت جو انتہائی پریشانی کا باعث بنے'] }
      ]
    },

    {
      id: 'contact_methods', label: 'What are all the ways to contact the clinic?', labelUr: 'کلینک سے رابطے کے تمام طریقے کیا ہیں؟', category: 'clinic' as QuickCategory, answer: 'We offer multiple convenient ways to reach us. Primary contact: +92 304 699 6267 (available for calls, WhatsApp messages, and SMS). This number is monitored during clinic hours (Mon-Sat 9 AM-6 PM) and for emergencies. Email: gonsteadchiropractic.org@gmail.com for non-urgent inquiries, appointment requests, or document sharing. You can also use the booking form on our website. For urgent same-day appointments or emergencies, calling or WhatsApp is fastest. We typically respond to emails within 24 hours during working days.', answerUr: 'ہم رابطے کے متعدد آسان طریقے پیش کرتے ہیں۔ بنیادی رابطہ: +92 304 699 6267 (کال، واٹس ایپ پیغامات، اور SMS کے لیے دستیاب)۔ یہ نمبر کلینک کے اوقات (پیر تا ہفتہ 9 صبح-6 شام) اور ایمرجنسی کے لیے مانیٹر کیا جاتا ہے۔ ای میل: gonsteadchiropractic.org@gmail.com غیر فوری پوچھ گچھ، ملاقات کی درخواستوں، یا دستاویزات کے اشتراک کے لیے۔', sections: [
        { title: 'Phone & WhatsApp', titleUr: 'فون اور واٹس ایپ', items: ['+92 304 699 6267', 'Best for: Urgent appointments, emergencies, quick questions', 'Available: Mon-Sat 9 AM-6 PM (Emergencies anytime)', 'Response time: Immediate during clinic hours'], itemsUr: ['+92 304 699 6267', 'بہترین: فوری ملاقاتیں، ایمرجنسی، فوری سوالات', 'دستیاب: پیر تا ہفتہ 9 صبح-6 شام (ایمرجنسی کسی بھی وقت)', 'جواب کا وقت: کلینک کے اوقات میں فوری'] },
        { title: 'Email', titleUr: 'ای میل', items: ['gonsteadchiropractic.org@gmail.com', 'Best for: Non-urgent inquiries, detailed questions, documents', 'Available: 24/7 (checked during business hours)', 'Response time: Within 24 hours on working days'], itemsUr: ['gonsteadchiropractic.org@gmail.com', 'بہترین: غیر فوری سوالات، تفصیلی سوالات، دستاویزات', 'دستیاب: 24/7 (کاروباری اوقات میں چیک کیا جاتا ہے)', 'جواب کا وقت: کام کے دنوں میں 24 گھنٹے کے اندر'] },
        { title: 'Website Booking', titleUr: 'ویب سائٹ بکنگ', items: ['Online form available on website', 'Best for: Advance booking, first-time patients', 'Confirmation sent via email or WhatsApp', 'Fill at your convenience, we\'ll confirm timing'], itemsUr: ['ویب سائٹ پر آن لائن فارم دستیاب', 'بہترین: پہلے سے بکنگ، پہلی بار مریض', 'تصدیق ای میل یا واٹس ایپ کے ذریعے بھیجی جاتی ہے', 'اپنی سہولت پر بھریں، ہم وقت کی تصدیق کریں گے'] }
      ]
    },

    {
      id: 'dr_bashir_experience', label: 'Tell me more about Dr. Bashir Khan\'s background', labelUr: 'ڈاکٹر بشیر خان کے پس منظر کے بارے میں مزید بتائیں', category: 'clinic' as QuickCategory, answer: 'Dr. Bashir Khan is one of Pakistan\'s most highly qualified chiropractors, holding Gonstead Certified Specialist Level V certification—the highest level in the prestigious Gonstead System. This certification requires years of advanced training, extensive clinical experience, and demonstrated mastery of the precise Gonstead technique. He has dedicated his career to helping patients achieve lasting relief through evidence-based chiropractic care. His approach combines thorough biomechanical analysis, patient education, and personalized treatment plans. Dr. Khan stays current with the latest research and techniques through continuous professional development, ensuring you receive world-class care right here in Pakistan.', answerUr: 'ڈاکٹر بشیر خان پاکستان کے انتہائی قابل chiropractors میں سے ایک ہیں، گونسٹیڈ سرٹیفائیڈ اسپیشلسٹ لیول V سرٹیفیکیشن رکھتے ہیں—معزز گونسٹیڈ سسٹم میں سب سے اعلیٰ سطح۔ اس سرٹیفیکیشن کے لیے سالوں کی جدید تربیت، وسیع کلینیکل تجربہ، اور درست گونسٹیڈ تکنیک میں مہارت کا مظاہرہ درکار ہے۔', sections: [
        { title: 'Qualifications', titleUr: 'قابلیت', items: ['Gonstead Certified Specialist Level V (Highest Level)', 'Doctor of Chiropractic (DC)', 'Advanced training in spinal biomechanics', 'Specialized in Gonstead System analysis and adjustment', 'Continuous education in latest techniques'], itemsUr: ['گونسٹیڈ سرٹیفائیڈ اسپیشلسٹ لیول V (سب سے اعلیٰ)', 'ڈاکٹر آف کائروپریکٹک (DC)', 'اسپائنل biomechanics میں جدید تربیت', 'گونسٹیڈ سسٹم تجزیہ اور ایڈجسٹمنٹ میں ماہر', 'تازہ ترین تکنیکوں میں مسلسل تعلیم'] },
        { title: 'Clinical Experience', titleUr: 'کلینیکل تجربہ', items: ['Years of practice treating Pakistani patients', 'Expertise in acute and chronic spinal conditions', 'Successfully treated thousands of cases', 'Complex cases including herniated discs, sciatica, chronic pain', 'Family care: infants to seniors'], itemsUr: ['پاکستانی مریضوں کے علاج کا سالوں کا تجربہ', 'تیز اور دائمی اسپائنل حالات میں مہارت', 'ہزاروں کیسز کا کامیاب علاج', 'پیچیدہ کیسز بشمول herniated discs، sciatica، دائمی درد', 'خاندانی دیکھ بھال: نوزائیدہ سے بزرگ تک'] },
        { title: 'Philosophy & Approach', titleUr: 'فلسفہ اور نقطہ نظر', items: ['Patient-centered care—your goals guide treatment', 'Precision over guesswork—thorough analysis always', 'Education empowers—understand your condition fully', 'Conservative first—surgery only when truly needed', 'Evidence-based practice with proven techniques'], itemsUr: ['مریض پر مبنی دیکھ بھال—آپ کے اہداف علاج کی رہنمائی کرتے ہیں', 'اندازے پر درستگی—ہمیشہ مکمل تجزیہ', 'تعلیم بااختیار بناتی ہے—اپنی حالت کو مکمل سمجھیں', 'پہلے محافظ—سرجری صرف واقعی ضرورت ہو تو', 'ثابت شدہ تکنیکوں کے ساتھ شواہد پر مبنی مشق'] }
      ]
    },

    {
      id: 'clinic_facilities', label: 'What facilities does your clinic have?', labelUr: 'آپ کے کلینک میں کون سی سہولیات ہیں؟', category: 'clinic' as QuickCategory, answer: 'Our clinic is equipped with modern, professional facilities designed for your comfort and optimal treatment outcomes. We have dedicated treatment rooms with specialized Gonstead chiropractic tables, a digital X-ray suite for precise imaging when needed, comfortable waiting area, clean restrooms, and free parking directly in front of the clinic. The clinic maintains high standards of cleanliness and hygiene with regular sanitization. We use state-of-the-art equipment including the Nervoscope for detecting nerve interference. The environment is calm, professional, and welcoming. Located near Peshawar Model School on Tehsil Road, Nowshera, we are easily accessible.', answerUr: 'ہمارا کلینک جدید، پیشہ ورانہ سہولیات سے لیس ہے جو آپ کے آرام اور بہترین علاج کے نتائج کے لیے ڈیزائن کیا گیا ہے۔ ہمارے پاس خصوصی گونسٹیڈ کائروپریکٹک ٹیبلز کے ساتھ علاج کے کمرے، ضرورت پڑنے پر درست امیجنگ کے لیے ڈیجیٹل ایکس رے سویٹ، آرام دہ انتظار گاہ، صاف بیت الخلاء، اور کلینک کے سامنے مفت پارکنگ ہے۔', sections: [
        { title: 'Treatment Areas', titleUr: 'علاج کے علاقے', items: ['Private treatment rooms for confidentiality', 'Specialized Gonstead chiropractic tables', 'Nervoscope for nerve interference detection', 'Digital X-ray suite (low radiation, high quality)', 'Clean, comfortable, professional environment'], itemsUr: ['رازداری کے لیے نجی علاج کے کمرے', 'خصوصی گونسٹیڈ کائروپریکٹک ٹیبلز', 'نرو مداخلت کی شناخت کے لیے Nervoscope', 'ڈیجیٹل ایکس رے سویٹ (کم تابکاری، اعلیٰ معیار)', 'صاف، آرام دہ، پیشہ ورانہ ماحول'] },
        { title: 'Patient Comfort', titleUr: 'مریض کا آرام', items: ['Comfortable waiting area with seating', 'Clean restrooms', 'Air conditioning for comfort', 'Calm, relaxing atmosphere', 'Professional, friendly staff'], itemsUr: ['بیٹھنے کی جگہ کے ساتھ آرام دہ انتظار گاہ', 'صاف بیت الخلاء', 'آرام کے لیے ایئر کنڈیشننگ', 'پرسکون، آرام دہ ماحول', 'پیشہ ور، دوستانہ عملہ'] },
        { title: 'Accessibility', titleUr: 'رسائی', items: ['Free parking in front of clinic', 'Ground floor access (no stairs)', 'Near Peshawar Model School, Tehsil Road, Nowshera', 'Easy to find with clear signage', 'Close to main road'], itemsUr: ['کلینک کے سامنے مفت پارکنگ', 'گراؤنڈ فلور تک رسائی (سیڑھیاں نہیں)', 'پشاور ماڈل اسکول کے قریب، تحصیل روڈ، نوشہرہ', 'واضح نشانات کے ساتھ تلاش کرنا آسان', 'مین روڈ کے قریب'] }
      ]
    },

    {
      id: 'new_patient_process', label: 'I\'m a new patient. What\'s the process?', labelUr: 'میں نیا مریض ہوں۔ عمل کیا ہے؟', category: 'booking' as QuickCategory, answer: 'Welcome! The new patient process is simple and thorough. First, contact us at +92 304 699 6267 to schedule your initial consultation—we\'ll find a time that works for you. Before your visit, if possible, gather any previous medical reports, X-rays, or MRI scans. On arrival, you\'ll fill out a brief health history form (5-10 minutes). Your first appointment lasts 45-90 minutes and includes: detailed consultation about your condition and goals, comprehensive spinal examination, diagnostic tests if needed (X-rays), explanation of findings, discussion of treatment options, and your first adjustment if appropriate. We ensure you understand everything before proceeding. You\'ll leave with a clear care plan, home exercise guidance if needed, and your next appointment scheduled.', answerUr: 'خوش آمدید! نئے مریض کا عمل سادہ اور مکمل ہے۔ پہلے، +92 304 699 6267 پر رابطہ کریں اپنی ابتدائی مشاورت شیڈول کرنے کے لیے۔ اپنی وزٹ سے پہلے، اگر ممکن ہو تو، کوئی بھی پرانی میڈیکل رپورٹس، ایکس رے، یا MRI اسکین جمع کریں۔ پہنچنے پر، آپ ایک مختصر صحت کی ہسٹری فارم بھریں گے (5-10 منٹ)۔', sections: [
        { title: 'Step 1: Book Appointment', titleUr: 'قدم 1: ملاقات بک کریں', items: ['Call/WhatsApp +92 304 699 6267', 'Or use website booking form', 'Or email gonsteadchiropractic.org@gmail.com', 'We\'ll find a convenient time for you', 'Allow 45-90 minutes for first visit'], itemsUr: ['کال/واٹس ایپ +92 304 699 6267', 'یا ویب سائٹ بکنگ فارم استعمال کریں', 'یا ای میل gonsteadchiropractic.org@gmail.com', 'ہم آپ کے لیے آسان وقت تلاش کریں گے', 'پہلی وزٹ کے لیے 45-90 منٹ رکھیں'] },
        { title: 'Step 2: Prepare for Visit', titleUr: 'قدم 2: وزٹ کی تیاری', items: ['Bring ID and insurance card (if applicable)', 'Gather previous X-rays, MRI, CT scans, medical reports', 'List current medications and supplements', 'Write down your symptoms and concerns', 'Wear comfortable, loose clothing'], itemsUr: ['ID اور انشورنس کارڈ لائیں (اگر لاگو ہو)', 'پرانے ایکس رے، MRI، CT اسکین، میڈیکل رپورٹس جمع کریں', 'موجودہ ادویات اور سپلیمنٹس کی فہرست', 'اپنی علامات اور خدشات لکھیں', 'آرام دہ، ڈھیلے کپڑے پہنیں'] },
        { title: 'Step 3: First Visit', titleUr: 'قدم 3: پہلی وزٹ', items: ['Fill health history form (5-10 min)', 'Detailed consultation with Dr. Bashir (10-15 min)', 'Comprehensive spinal exam (15-20 min)', 'X-rays if indicated (5-10 min)', 'Findings explained clearly (10-15 min)', 'First adjustment if appropriate (10-15 min)'], itemsUr: ['صحت کی ہسٹری فارم بھریں (5-10 منٹ)', 'ڈاکٹر بشیر کے ساتھ تفصیلی مشاورت (10-15 منٹ)', 'مکمل اسپائنل معائنہ (15-20 منٹ)', 'ضروری ہو تو ایکس رے (5-10 منٹ)', 'نتائج واضح طور پر سمجھائے گئے (10-15 منٹ)', 'مناسب ہو تو پہلی ایڈجسٹمنٹ (10-15 منٹ)'] },
        { title: 'Step 4: After First Visit', titleUr: 'قدم 4: پہلی وزٹ کے بعد', items: ['Receive care plan and recommendations', 'Home exercise guidance if needed', 'Post-visit instructions (ice/activity)', 'Schedule follow-up appointment', 'Feel free to ask any questions'], itemsUr: ['کیئر پلان اور تجاویز حاصل کریں', 'ضرورت ہو تو گھریلو ورزش کی رہنمائی', 'وزٹ کے بعد کی ہدایات (برف/سرگرمی)', 'فالو اپ ملاقات شیڈول کریں', 'کوئی بھی سوال پوچھنے میں آزاد محسوس کریں'] }
      ]
    },

    // ADDITIONAL ESSENTIAL PATIENT/VISITOR FAQs
    {
      id: 'wait_time', label: 'How long is the typical wait time?', labelUr: 'عام انتظار کا وقت کتنا ہے؟', category: 'clinic' as QuickCategory, answer: 'We strive to see patients on time. Typical wait times are 5-15 minutes. However, some patients require more time for complex cases or emergencies, which may cause delays. We appreciate your patience and always call ahead if running late. Booking appointments helps minimize wait times.', answerUr: 'ہم کوشش کرتے ہیں کہ مریضوں کو وقت پر دیکھیں۔ عام انتظار کا وقت 5-15 منٹ ہے۔ تاہم، کچھ مریضوں کو پیچیدہ کیسز یا ایمرجنسی کے لیے زیادہ وقت کی ضرورت ہوتی ہے جو تاخیر کا سبب بن سکتا ہے۔', sections: [
        { title: 'What to Expect', titleUr: 'کیا توقع کریں', items: ['Average wait: 5-15 minutes', 'Emergencies may cause delays', 'We notify you if running significantly late', 'Appointments minimize wait times'], itemsUr: ['اوسط انتظار: 5-15 منٹ', 'ایمرجنسی تاخیر کا سبب بن سکتی ہے', 'خاطر خواہ تاخیر ہو تو ہم آپ کو مطلع کرتے ہیں', 'ملاقاتیں انتظار کا وقت کم کرتی ہیں'] },
        { title: 'Tips to Minimize Wait', titleUr: 'انتظار کم کرنے کے ٹپس', items: ['Book appointment in advance', 'Arrive 5-10 minutes early', 'Call ahead to check current status', 'Avoid peak hours (10 AM-12 PM, 3-5 PM)'], itemsUr: ['پہلے سے ملاقات بک کریں', '5-10 منٹ پہلے پہنچیں', 'موجودہ صورتحال چیک کرنے کے لیے پہلے کال کریں', 'مصروف اوقات سے بچیں (10 صبح-12 دوپہر، 3-5 شام)'] }
      ]
    },

    {
      id: 'visiting_rules', label: 'What are the clinic rules and etiquette?', labelUr: 'کلینک کے قواعد اور آداب کیا ہیں؟', category: 'clinic' as QuickCategory, answer: 'We maintain a respectful, professional environment for all patients. Please arrive on time, silence mobile phones during treatment, respect privacy of other patients, follow hygiene protocols (hand sanitizer available), one support person maximum per patient, children must be supervised, and no smoking anywhere in or near the clinic. These simple guidelines ensure everyone has a positive experience.', answerUr: 'ہم تمام مریضوں کے لیے ایک باعزت، پیشہ ورانہ ماحول برقرار رکھتے ہیں۔ براہ کرم وقت پر پہنچیں، علاج کے دوران موبائل فون خاموش کریں، دوسرے مریضوں کی پرائیویسی کا احترام کریں، حفظان صحت کے پروٹوکول پر عمل کریں، ہر مریض کے ساتھ زیادہ سے زیادہ ایک معاون شخص، بچوں کی نگرانی ضروری ہے۔', sections: [
        { title: 'Basic Etiquette', titleUr: 'بنیادی آداب', items: ['Arrive on time for appointments', 'Silence mobile phones during treatment', 'Speak softly in waiting area', 'Respect privacy of other patients', 'Follow staff instructions'], itemsUr: ['ملاقات کے لیے وقت پر پہنچیں', 'علاج کے دوران موبائل فون خاموش کریں', 'انتظار گاہ میں آہستہ بولیں', 'دوسرے مریضوں کی پرائیویسی کا احترام کریں', 'عملے کی ہدایات پر عمل کریں'] },
        { title: 'Health & Hygiene', titleUr: 'صحت اور صفائی', items: ['Use hand sanitizer upon entry', 'Cover coughs and sneezes', 'If you have fever or contagious illness, reschedule', 'Wear clean, comfortable clothing'], itemsUr: ['داخل ہوتے وقت ہینڈ سینیٹائزر استعمال کریں', 'کھانسی اور چھینک کو ڈھانپیں', 'اگر بخار یا متعدی بیماری ہو تو دوبارہ شیڈول کریں', 'صاف، آرام دہ لباس پہنیں'] },
        { title: 'Visitors & Children', titleUr: 'زائرین اور بچے', items: ['Maximum one support person per patient', 'Children must be supervised at all times', 'Waiting area is for patients and companions only', 'No running or loud behavior'], itemsUr: ['ہر مریض کے ساتھ زیادہ سے زیادہ ایک معاون', 'بچوں کی ہر وقت نگرانی ضروری', 'انتظار گاہ صرف مریضوں اور ساتھیوں کے لیے', 'دوڑنا یا شور مچانا منع ہے'] },
        { title: 'Prohibited', titleUr: 'ممنوع', items: ['No smoking anywhere on premises', 'No outside food or drinks in treatment areas', 'No recording (video/audio) without explicit permission', 'No disruptive behavior'], itemsUr: ['احاطے میں کہیں بھی سگریٹ نوشی منع', 'علاج کے علاقوں میں باہر کا کھانا یا مشروبات منع', 'واضح اجازت کے بغیر ریکارڈنگ منع', 'خلل ڈالنے والا رویہ منع'] }
      ]
    },

    {
      id: 'patient_rights', label: 'What are my rights as a patient?', labelUr: 'بطور مریض میرے کیا حقوق ہیں؟', category: 'clinic' as QuickCategory, answer: 'You have the right to: clear information about your condition and treatment options, ask questions and receive honest answers, give or withhold informed consent, privacy and confidentiality, respectful treatment regardless of background, access to your medical records, second opinions, and to refuse or stop treatment at any time. We are committed to protecting these rights and providing patient-centered care.', answerUr: 'آپ کو حق ہے: اپنی حالت اور علاج کے اختیارات کے بارے میں واضح معلومات، سوالات پوچھنے اور ایمانداری سے جوابات حاصل کرنے، باخبر رضامندی دینے یا روکنے، پرائیویسی اور رازداری، پس منظر سے قطع نظر باعزت سلوک، اپنے میڈیکل ریکارڈ تک رسائی، دوسری رائے، اور کسی بھی وقت علاج سے انکار یا روکنے کا۔', sections: [
        { title: 'Information & Consent', titleUr: 'معلومات اور رضامندی', items: ['Full explanation of diagnosis and findings', 'Clear description of proposed treatment', 'Discussion of benefits, risks, and alternatives', 'Right to ask questions and receive understandable answers', 'Give or refuse informed consent'], itemsUr: ['تشخیص اور نتائج کی مکمل وضاحت', 'تجویز کردہ علاج کی واضح تفصیل', 'فوائد، خطرات اور متبادل پر بحث', 'سوالات پوچھنے اور سمجھ میں آنے والے جوابات حاصل کرنے کا حق', 'باخبر رضامندی دینا یا انکار کرنا'] },
        { title: 'Privacy & Respect', titleUr: 'پرائیویسی اور احترام', items: ['Confidentiality of medical information', 'Privacy during examination and treatment', 'Respectful, dignified treatment', 'Cultural and religious considerations honored', 'No discrimination based on any factor'], itemsUr: ['میڈیکل معلومات کی رازداری', 'معائنے اور علاج کے دوران پرائیویسی', 'باعزت، وقار آمیز سلوک', 'ثقافتی اور مذہبی تحفظات کا احترام', 'کسی بھی عنصر کی بنیاد پر امتیاز نہیں'] },
        { title: 'Autonomy & Access', titleUr: 'خودمختاری اور رسائی', items: ['Right to refuse any procedure', 'Stop treatment at any time without penalty', 'Seek second opinion from another provider', 'Access your medical records upon request', 'Complaint or grievance process available'], itemsUr: ['کسی بھی طریقہ کار سے انکار کا حق', 'کسی بھی وقت بغیر جرمانے کے علاج روکیں', 'کسی دوسرے فراہم کنندہ سے دوسری رائے لیں', 'درخواست پر اپنے میڈیکل ریکارڈ تک رسائی', 'شکایت یا grievance کا عمل دستیاب'] }
      ]
    },

    {
      id: 'medical_records', label: 'Can I get a copy of my medical records?', labelUr: 'کیا میں اپنے میڈیکل ریکارڈ کی کاپی حاصل کر سکتا ہوں؟', category: 'clinic' as QuickCategory, answer: 'Yes, absolutely. You have the right to access your medical records. Submit a written request (in person, email, or mail) with your name, date of birth, and specific records needed. We typically provide copies within 3-7 working days. There may be a nominal fee for copying costs. Records include consultation notes, examination findings, X-ray images/reports, treatment plans, and progress notes. Digital copies can be provided via email or CD.', answerUr: 'جی ہاں، بالکل۔ آپ کو اپنے میڈیکل ریکارڈ تک رسائی کا حق ہے۔ اپنے نام، تاریخ پیدائش، اور مطلوبہ مخصوص ریکارڈ کے ساتھ ایک تحریری درخواست جمع کرائیں۔ ہم عام طور پر 3-7 کام کے دنوں میں کاپیاں فراہم کرتے ہیں۔', sections: [
        { title: 'How to Request', titleUr: 'درخواست کیسے کریں', items: ['Submit written request (in person, email, or mail)', 'Include: Full name, date of birth, contact info', 'Specify which records you need', 'Photo ID required for verification', 'Allow 3-7 working days for processing'], itemsUr: ['تحریری درخواست جمع کرائیں (ذاتی، ای میل، یا ڈاک)', 'شامل کریں: مکمل نام، تاریخ پیدائش، رابطے کی معلومات', 'وضاحت کریں کہ کون سے ریکارڈ چاہیے', 'تصدیق کے لیے فوٹو ID ضروری', '3-7 کام کے دنوں کی اجازت دیں'] },
        { title: 'What\'s Included', titleUr: 'کیا شامل ہے', items: ['Initial consultation notes', 'Examination findings and assessments', 'X-ray images and reports', 'Treatment plans and recommendations', 'Progress notes from follow-up visits', 'Any diagnostic test results'], itemsUr: ['ابتدائی مشاورت کے نوٹس', 'معائنے کے نتائج اور اندازے', 'ایکس رے تصاویر اور رپورٹس', 'علاج کے منصوبے اور تجاویز', 'فالو اپ وزٹس سے ترقی کے نوٹس', 'کوئی بھی تشخیصی ٹیسٹ کے نتائج'] },
        { title: 'Format Options', titleUr: 'فارمیٹ کے اختیارات', items: ['Paper copies (printed)', 'Digital copies via email (PDF)', 'CD/USB with images and documents', 'Nominal fee may apply for copying costs'], itemsUr: ['کاغذی کاپیاں (پرنٹ)', 'ای میل کے ذریعے ڈیجیٹل کاپیاں (PDF)', 'تصاویر اور دستاویزات کے ساتھ CD/USB', 'کاپی کی لاگت کے لیے معمولی فیس لگ سکتی ہے'] }
      ]
    },

    {
      id: 'refer_friend', label: 'Do you have a referral program?', labelUr: 'کیا آپ کا ریفرل پروگرام ہے؟', category: 'clinic' as QuickCategory, answer: 'We deeply appreciate referrals! When someone you care about experiences the same quality care, it\'s the highest compliment. While we don\'t currently have a formal rewards program, patient referrals are the foundation of our practice. If you\'ve had a positive experience, please feel free to share our contact information with friends and family who might benefit from chiropractic care. Word-of-mouth recommendations from satisfied patients mean everything to us.', answerUr: 'ہم ریفرل کی بہت تعریف کرتے ہیں! جب کوئی جس کی آپ کو پرواہ ہے وہی معیاری دیکھ بھال حاصل کرے، یہ سب سے بڑی تعریف ہے۔ اگرچہ ہمارے پاس فی الوقت کوئی رسمی انعامات پروگرام نہیں ہے، مریضوں کے ریفرل ہماری پریکٹس کی بنیاد ہیں۔', sections: [
        { title: 'How to Refer', titleUr: 'ریفر کیسے کریں', items: ['Share our contact: +92 304 699 6267', 'Give our website or social media info', 'Tell them about your positive experience', 'They can mention your name when booking (optional)', 'We\'ll provide them the same quality care'], itemsUr: ['ہمارا رابطہ شیئر کریں: +92 304 699 6267', 'ہماری ویب سائٹ یا سوشل میڈیا کی معلومات دیں', 'انہیں اپنے مثبت تجربے کے بارے میں بتائیں', 'بکنگ کے وقت آپ کا نام بتا سکتے ہیں (اختیاری)', 'ہم انہیں وہی معیاری دیکھ بھال فراہم کریں گے'] },
        { title: 'Who Benefits from Chiropractic', titleUr: 'کائروپریکٹک سے کون فائدہ اٹھاتا ہے', items: ['Anyone with back, neck, or joint pain', 'People with headaches or migraines', 'Athletes seeking performance optimization', 'Office workers with posture issues', 'Families wanting preventive wellness care'], itemsUr: ['کمر، گردن، یا جوڑوں کے درد والا کوئی بھی', 'سر درد یا مائیگرین والے لوگ', 'کارکردگی کی بہتری چاہنے والے کھلاڑی', 'پوسچر کے مسائل والے دفتری کارکن', 'روک تھام کی wellness کیئر چاہنے والے خاندان'] }
      ]
    },

    {
      id: 'disability_access', label: 'Is the clinic accessible for people with disabilities?', labelUr: 'کیا کلینک معذوری والے لوگوں کے لیے قابل رسائی ہے؟', category: 'clinic' as QuickCategory, answer: 'Yes, we strive to accommodate all patients. The clinic is on the ground floor with no stairs required for entry. Free parking is available directly in front. We can assist patients with mobility challenges from vehicle to clinic. Treatment tables can be adjusted for easier access. If you have specific accessibility needs, please inform us when booking so we can make appropriate arrangements.', answerUr: 'جی ہاں، ہم تمام مریضوں کو سہولت فراہم کرنے کی کوشش کرتے ہیں۔ کلینک گراؤنڈ فلور پر ہے، داخلے کے لیے سیڑھیاں نہیں ہیں۔ سامنے مفت پارکنگ دستیاب ہے۔ ہم حرکت کے چیلنجز والے مریضوں کی گاڑی سے کلینک تک مدد کر سکتے ہیں۔', sections: [
        { title: 'Physical Access', titleUr: 'جسمانی رسائی', items: ['Ground floor location—no stairs', 'Wide doorways for wheelchair access', 'Free parking directly in front', 'Staff assistance available from vehicle to clinic', 'Adjustable treatment tables'], itemsUr: ['گراؤنڈ فلور—سیڑھیاں نہیں', 'وہیل چیئر رسائی کے لیے چوڑے دروازے', 'سامنے مفت پارکنگ', 'گاڑی سے کلینک تک عملے کی مدد دستیاب', 'ایڈجسٹ ہونے والے علاج کے ٹیبل'] },
        { title: 'Special Accommodations', titleUr: 'خصوصی سہولیات', items: ['Modified treatment techniques for limited mobility', 'Extra time allowed for those needing it', 'Support person welcome to assist', 'Communication aids available if needed', 'Flexible positioning options'], itemsUr: ['محدود حرکت کے لیے تبدیل کردہ علاج کی تکنیکیں', 'ضرورت والوں کے لیے اضافی وقت', 'مدد کے لیے معاون شخص کا خیرمقدم', 'ضرورت ہو تو رابطے کی مدد دستیاب', 'لچکدار پوزیشننگ کے اختیارات'] },
        { title: 'Please Inform Us', titleUr: 'براہ کرم ہمیں مطلع کریں', items: ['Call ahead to discuss specific needs', 'Mention accessibility requirements when booking', 'We\'ll make appropriate arrangements', 'Your comfort and safety are priorities'], itemsUr: ['مخصوص ضروریات پر بات کرنے کے لیے پہلے کال کریں', 'بکنگ کے وقت رسائی کی ضروریات کا ذکر کریں', 'ہم مناسب انتظامات کریں گے', 'آپ کا آرام اور حفاظت ترجیحات ہیں'] }
      ]
    }
  ]

  const [selectedCategory, setSelectedCategory] = useState<'all' | QuickCategory>('all')
  const [expandAll, setExpandAll] = useState(false)

  // Persist FAQ selection across openings (client-only)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('chatbot_faq_selected')
        if (saved) setFaqSelected(saved)
      }
    } catch { }
  }, [])
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && showQuick) {
        localStorage.setItem('chatbot_faq_selected', faqSelected || '')
      }
    } catch { }
  }, [faqSelected, showQuick])

  const getSummary = (q: QQ) => (language === 'ur' && q.answerUr ? q.answerUr : q.answer)
  const getTitleText = (q: QQ) => (language === 'ur' && q.labelUr ? q.labelUr : q.label)
  const categoryLabel = (k: QuickCategory) => {
    if (language === 'ur') {
      return k === 'treatment' ? 'علاج' : k === 'conditions' ? 'مسائل' : k === 'clinic' ? 'کلینک' : 'بکنگ'
    }
    return k === 'treatment' ? 'Treatment' : k === 'conditions' ? 'Conditions' : k === 'clinic' ? 'Clinic' : 'Booking'
  }
  const copyDetailed = (q: QQ) => {
    const sections = (q.sections && q.sections.length ? q.sections : getSections(q))
    const lines = [getTitleText(q), '', getSummary(q)]
    sections.forEach(sec => {
      const sectionTitle = (language === 'ur' && sec.titleUr) ? sec.titleUr : sec.title
      const sectionItems = (language === 'ur' && sec.itemsUr) ? sec.itemsUr : sec.items
      lines.push('', `${sectionTitle}:`)
      sectionItems.forEach(it => lines.push(`• ${it}`))
    })
    const text = lines.join('\n')
    try { navigator.clipboard?.writeText(text) } catch { }
  }
  const getSections = (q: QQ): DetailSection[] => {
    const id = q.id
    const cat = q.category

    const section = (title: string, items: string[]): DetailSection => ({ title, items })

    // Category defaults
    const defaults: Record<QuickCategory, DetailSection[]> = {
      treatment: [
        section('Overview', ['What it is and why it matters', 'Who benefits', 'Safety considerations']),
        section('What to expect', ['Clinician assessment steps', 'Typical session flow', 'Time estimates']),
        section('Aftercare', ['What to do after the session', 'Warning signs to watch for'])
      ],
      clinic: [
        section('Overview', ['Key information summary']),
        section('Details', ['How to access or use this information']),
        section('Tips', ['Helpful suggestions for a smooth visit'])
      ],
      booking: [
        section('How to book', ['Available channels', 'Confirmation steps']),
        section('What to prepare', ['Information you may need to provide']),
        section('Tips', ['Best times and practices'])
      ],
      conditions: [
        section('Likely contributors', ['Common biomechanical or lifestyle drivers']),
        section('Treatment', ['Specific care focus', 'Education and modifications']),
        section('Exercises', ['Starter movements and progressions']),
        section('When to seek help', ['Red flags and escalation guidance'])
      ]
    }

    // Per-ID enrichments
    switch (id) {
      // Treatment
      case 'first_visit':
        return [
          section('Steps', ['History and goals discussion', 'Posture and movement assessment', 'Neurological/orthopedic checks as needed', 'Gonstead analysis and plan']),
          section('Duration', ['Initial visit ~45–90 minutes depending on complexity']),
          section('What to bring', ['ID, previous reports/images, medication list']),
          section('Tips', ['Arrive 10 minutes early', 'Wear comfortable clothing'])
        ]
      case 'xray':
        return [
          section('When needed', ['Clinical indicators based on safety and precision needs', 'Not routine for every case']),
          section('Safety', ['Used judiciously with proper shielding'])
        ]
      case 'sessions':
        return [
          section('Depends on', ['Condition severity and duration', 'Healing response and goals']),
          section('Typical plan', ['Many improve within 1–3 sessions', 'Tapered follow‑ups for stability'])
        ]
      case 'adjustment_feel':
        return [
          section('Sensations', ['Relief, lightness, or short‑lived soreness (like post‑exercise)']),
          section('Aftercare', ['Hydrate', 'Avoid heavy lifting 24h', 'Ice 10–15 minutes if sore'])
        ]
      case 'safety':
        return [
          section('Screening', ['Red‑flag checks and referrals as needed']),
          section('Technique', ['Specific, controlled adjustments emphasize safety'])
        ]
      case 'aftercare':
        return [
          section('24h guidance', ['Hydrate well', 'Avoid strenuous activity', 'Ice for soreness']),
          section('Habits', ['Follow posture and movement advice', 'Resume normal activity gradually'])
        ]
      case 'exercise':
        return [
          section('Types', ['Mobility for stiff segments', 'Stabilization for weak links', 'Ergonomics and habit cues']),
          section('Frequency', ['Short, frequent sessions work best initially'])
        ]
      case 'followup':
        return [
          section('Scheduling', ['Initially closer visits', 'Taper as stability improves']),
          section('Goals', ['Maintain correction', 'Build resilience'])
        ]
      case 'kids':
        return [
          section('Safety', ['Age‑appropriate, gentle techniques']),
          section('Modifications', ['Pressure and positions adapted to child'])
        ]
      case 'older_adults':
        return [
          section('Considerations', ['Bone density awareness', 'Comfort‑focused positioning']),
          section('Technique', ['Gentle, specific adjustments'])
        ]
      case 'pregnancy':
        return [
          section('Positioning', ['Modified tables and cushions for comfort']),
          section('Benefits', ['Helpful for low back, pelvic, and rib discomfort'])
        ]
      case 'contra':
        return [
          section('Absolute vs relative', ['Absolute contraindications are rare', 'Relative cases managed cautiously']),
          section('Process', ['Screening and referral when necessary'])
        ]
      case 'duration':
        return [
          section('Time', ['Initial 45–90 minutes (exam + first care if appropriate)', 'Follow‑ups 20–45 minutes'])
        ]
      case 'manual_vs_machine':
        return [
          section('Approach', ['Method chosen for precision and safety', 'Manual and assisted tools can both help'])
        ]

      // Clinic
      case 'hours':
        return [
          section('Schedule', ['Mon–Sat 9:00 AM–6:00 PM', 'Sunday emergency only']),
          section('Tip', ['Call ahead for acute pain to prioritize same‑day slots'])
        ]
      case 'location':
        return [
          section('Address', ['Near Peshawar Model School, Tehsil Road, Nowshera']),
          section('Finding us', ['See Contact section map', 'Free parking available'])
        ]
      case 'payments':
        return [
          section('Accepted', ['Cash, JazzCash, Easypaisa']),
          section('Notes', ['Fees shared at booking after assessment'])
        ]
      case 'languages':
        return [
          section('Support', ['English and Urdu', 'We match your preference'])
        ]
      case 'emergency':
        return [
          section('Urgent care', ['Call +92 304 699 6267', 'Acute pain prioritized when possible'])
        ]
      case 'parking':
        return [
          section('Parking', ['Free parking in front of clinic'])
        ]
      case 'equipment':
        return [
          section('Tools', ['Gonstead tables', 'Nervoscope', 'Digital X‑ray when indicated'])
        ]
      case 'records':
        return [
          section('Bring', ['Prior X‑rays/MRI/CT and reports', 'Medication list']),
          section('Reason', ['Helps tailor your plan'])
        ]
      case 'informed_consent':
        return [
          section('Process', ['Findings, benefits, and risks explained', 'Proceed only with your consent'])
        ]
      case 'privacy':
        return [
          section('Policy', ['Your information is confidential', 'Used only for your care'])
        ]
      case 'contact_options':
        return [
          section('Channels', ['Phone/WhatsApp +92 304 699 6267', 'Email gonsteadchiropractic.org@gmail.com'])
        ]
      case 'prep':
        return [
          section('Before visit', ['Wear comfortable clothing', 'Avoid heavy meal just before', 'List symptoms/meds', 'Bring prior records'])
        ]
      case 'after_visit':
        return [
          section('Plan', ['Do’s and don’ts', 'Posture tips', 'Exercises as needed']),
          section('Follow‑up', ['Scheduled if required'])
        ]

      // Booking
      case 'booking':
        return [
          section('Ways to book', ['Chat Book button', 'Call/WhatsApp +92 304 699 6267', 'Site booking form']),
          section('Confirmation', ['We confirm and set reminders where applicable'])
        ]
      case 'same_day':
        return [
          section('Availability', ['Often for acute pain', 'Contact early for best chance'])
        ]
      case 'reschedule':
        return [
          section('How', ['Call/WhatsApp as soon as possible', 'We’ll arrange the next slot'])
        ]
      case 'intake':
        return [
          section('Purpose', ['Understand concerns and ensure safety']),
          section('Time', ['Brief form where applicable'])
        ]
      case 'video':
        return [
          section('Use cases', ['Initial advice or follow‑ups', 'In‑clinic care remains most comprehensive'])
        ]
      case 'reminders':
        return [
          section('Modes', ['WhatsApp/SMS/email where applicable'])
        ]
      case 'duration_booking':
        return [
          section('Time planning', ['Initial up to 60–90 minutes', 'Follow‑ups 20–45 minutes'])
        ]
      case 'documents':
        return [
          section('Bring', ['ID', 'Prior imaging/reports', 'Medication list', 'Referral notes if available'])
        ]
      case 'eligibility':
        return [
          section('General', ['Most musculoskeletal cases are suitable', 'Screening and referrals as needed'])
        ]
      case 'family':
        return [
          section('Attendance', ['One accompanying person welcome if you prefer'])
        ]

      // Conditions not explicitly expanded above
      case 'mid_back':
        return [
          section('Contributors', ['Thoracic stiffness', 'Posture and breathing patterns']),
          section('Treatment', ['Specific adjustments', 'Breathing and posture drills']),
          section('Exercises', ['Thoracic extensions, open‑book rotations'])
        ]
      case 'shoulder':
        return [
          section('Contributors', ['Neck/upper‑back mechanics', 'Scapular control']),
          section('Treatment', ['Regional assessment and specific care', 'Mobility + strengthening']),
          section('Exercises', ['Scapular retraction, external rotations'])
        ]
      case 'knee':
        return [
          section('Contributors', ['Hip/ankle mechanics', 'Posture/load management']),
          section('Treatment', ['Targeted correction + rehab']),
          section('Exercises', ['Glute med, quad control, ankle mobility'])
        ]
      case 'sports':
        return [
          section('Issues', ['Overuse and acute strains']),
          section('Plan', ['Alignment, load management, return‑to‑play guidance'])
        ]
      case 'pinched_nerve':
        return [
          section('Usually due to', ['Joint/disc mechanics', 'Inflammation/irritation']),
          section('Care', ['Precise adjustments', 'Activity modification'])
        ]
      case 'tmj':
        return [
          section('Interplay', ['Neck and jaw mechanics']),
          section('Care', ['Gentle adjustments', 'Habit changes (avoid clenching)'])
        ]
      case 'post_surgery':
        return [
          section('Approach', ['Case‑by‑case with surgeon guidance']),
          section('Focus', ['Safe mobility, alignment, function'])
        ]
      case 'numb_tingling':
        return [
          section('Possible causes', ['Nerve irritation from spinal mechanics']),
          section('Next steps', ['Thorough assessment', 'Referral where indicated'])
        ]
      case 'desk':
        return [
          section('Problem', ['Prolonged sitting and ergonomics']),
          section('Plan', ['Micro‑breaks', 'Specific care and mobility']),
          section('Exercises', ['Chin tucks, thoracic extensions, hip openers'])
        ]
      case 'sleep':
        return [
          section('Positions', ['Side with pillow between knees', 'Back with pillow under knees']),
          section('Avoid', ['Stomach sleeping']),
          section('Neck', ['Keep neutral with appropriate pillow height'])
        ]
      case 'mattress':
        return [
          section('Guidance', ['Medium‑firm suits most', 'Aim for neutral spine', 'Prioritize comfort/support'])
        ]
      case 'foot':
        return [
          section('Chain effect', ['Foot mechanics affect knees/hips/back']),
          section('Plan', ['Assess alignment', 'Footwear and rehab guidance'])
        ]
      case 'lifting':
        return [
          section('Technique', ['Neutral spine', 'Hinge at hips', 'Keep load close', 'Exhale on effort', 'Avoid twisting while lifting'])
        ]
      case 'hydration':
        return [
          section('Why it matters', ['Supports discs and recovery', 'Pair with protein/micronutrients and sleep'])
        ]
      case 'stress':
        return [
          section('Effect', ['Sensitizes the nervous system']),
          section('Plan', ['Care + breathing, movement, and sleep hygiene'])
        ]
    }

    // Fallback to category defaults
    return defaults[cat] || []
  }

  const renderStackedBar = (parts: { label: string; color: string; pct: number }[]) => (
    <div className="w-full h-3 rounded-full overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800">
      <div className="flex h-full w-full">
        {parts.map((p, i) => (
          <div key={i} className={`${p.color} h-full`} style={{ width: `${Math.max(0, Math.min(100, p.pct))}%` }} title={`${p.label} ${p.pct.toFixed(0)}%`} />
        ))}
      </div>
    </div>
  )

  const renderSparkline = () => (
    <svg viewBox="0 0 100 24" className="w-full h-10 text-[rgb(66,139,124)]">
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points="0,20 10,18 20,16 30,14 40,12 50,10 60,9 70,7 80,6 90,5 100,4" />
    </svg>
  )

  const renderDonut = (segments: { color: string; pct: number; label: string }[]) => {
    const R = 18
    const C = 2 * Math.PI * R
    let offset = 0
    return (
      <svg viewBox="0 0 44 44" className="w-16 h-16">
        <circle cx="22" cy="22" r={R} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        {segments.map((s, i) => {
          const dash = (Math.max(0, Math.min(100, s.pct)) / 100) * C
          const el = (
            <circle key={i} cx="22" cy="22" r={R} fill="none" stroke={s.color} strokeWidth="8" strokeDasharray={`${dash} ${C - dash}`} strokeDashoffset={-offset} transform="rotate(-90 22 22)" />
          )
          offset += dash
          return el
        })}
      </svg>
    )
  }

  const renderBars = (bars: { label: string; value: number; color: string }[]) => (
    <div className="flex items-end gap-1 w-full h-20">
      {bars.map((b, i) => (
        <div key={i} className="flex flex-col items-center justify-end gap-1">
          <div className="w-6 rounded-t-md" style={{ height: `${Math.max(0, Math.min(100, b.value))}%`, background: b.color }} />
          <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate w-8 text-center">{b.label}</div>
        </div>
      ))}
    </div>
  )

  const renderStepper = (steps: string[]) => (
    <div className="flex items-center gap-2 flex-wrap">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[rgb(66,139,124)]/10 text-[rgb(66,139,124)] grid place-items-center text-xs font-semibold border border-[rgb(66,139,124)]/30">{i + 1}</div>
          <span className="text-[12px] md:text-sm text-gray-700 dark:text-gray-300 mr-2">{s}</span>
          {i < steps.length - 1 && <div className="w-6 h-px bg-gray-300 dark:bg-gray-700" />}
        </div>
      ))}
    </div>
  )

  const buildCareMix = (q: QQ) => {
    const secs = (q.sections && q.sections.length ? q.sections : getSections(q))
    const take = (k: string) => secs.some(s => s.title.toLowerCase().includes(k)) ? secs.find(s => s.title.toLowerCase().includes(k))!.items.length : 0
    const treatment = take('treatment') + take('plan') + take('approach') + take('care')
    const exercises = take('exercise')
    const after = take('aftercare') + take('self') + take('tips') + take('habits')
    const red = take('when to seek') + take('red') + take('urgent')
    const total = Math.max(1, treatment + exercises + after + red)
    return [
      { label: 'Treatment', color: 'bg-emerald-500/70', pct: (treatment / total) * 100 },
      { label: 'Exercises', color: 'bg-cyan-500/70', pct: (exercises / total) * 100 },
      { label: 'Aftercare', color: 'bg-teal-500/70', pct: (after / total) * 100 },
      { label: 'Alerts', color: 'bg-rose-500/70', pct: (red / total) * 100 },
    ]
  }

  const renderVisuals = (q: QQ) => {
    const cat = q.category
    // Per‑question custom visuals - comprehensive for EVERY question
    const custom = () => {
      // CLINIC QUESTIONS
      if (q.id === 'hours') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Weekly hours distribution</div>
            {renderBars([
              { label: 'Mon', value: 90, color: '#0ea5a8' },
              { label: 'Tue', value: 90, color: '#0ea5a8' },
              { label: 'Wed', value: 90, color: '#0ea5a8' },
              { label: 'Thu', value: 90, color: '#0ea5a8' },
              { label: 'Fri', value: 90, color: '#0ea5a8' },
              { label: 'Sat', value: 90, color: '#0ea5a8' },
              { label: 'Sun', value: 20, color: '#f59e0b' },
            ])}
          </div>
        )
      }
      if (q.id === 'location') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">How to reach us</div>
            {renderStackedBar([
              { label: 'Google Maps', color: 'bg-blue-500/70', pct: 40 },
              { label: 'Local directions', color: 'bg-green-500/70', pct: 35 },
              { label: 'Call for guidance', color: 'bg-orange-500/70', pct: 25 },
            ])}
          </div>
        )
      }
      if (q.id === 'payments') {
        return (
          <div className="flex items-center gap-3">
            {renderDonut([
              { color: '#10b981', pct: 50, label: 'Cash' },
              { color: '#06b6d4', pct: 30, label: 'JazzCash' },
              { color: '#f59e0b', pct: 20, label: 'Easypaisa' },
            ])}
            <div className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400">
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#10b981' }} />Cash ~50%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#06b6d4' }} />JazzCash ~30%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#f59e0b' }} />Easypaisa ~20%</div>
            </div>
          </div>
        )
      }
      if (q.id === 'languages') {
        return (
          <div className="flex items-center gap-3">
            {renderDonut([
              { color: '#10b981', pct: 60, label: 'Urdu' },
              { color: '#06b6d4', pct: 40, label: 'English' },
            ])}
            <div className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400">
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#10b981' }} />Urdu ~60%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#06b6d4' }} />English ~40%</div>
            </div>
          </div>
        )
      }
      if (q.id === 'emergency') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Response time</div>
            {renderBars([
              { label: 'Call', value: 95, color: '#ef4444' },
              { label: 'WhatsApp', value: 85, color: '#f59e0b' },
              { label: 'Visit', value: 90, color: '#10b981' },
            ])}
          </div>
        )
      }
      if (q.id === 'parking') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Parking ease</div>
            {renderStackedBar([
              { label: 'Free parking', color: 'bg-green-500/70', pct: 100 },
            ])}
          </div>
        )
      }
      if (q.id === 'equipment') {
        return (
          <div className="flex items-center gap-3">
            {renderDonut([
              { color: '#10b981', pct: 40, label: 'Gonstead tables' },
              { color: '#06b6d4', pct: 35, label: 'Nervoscope' },
              { color: '#f59e0b', pct: 25, label: 'Digital X-ray' },
            ])}
            <div className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400">
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#10b981' }} />Tables ~40%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#06b6d4' }} />Nervoscope ~35%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#f59e0b' }} />X-ray ~25%</div>
            </div>
          </div>
        )
      }
      if (q.id === 'records') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Helpful records</div>
            {renderBars([
              { label: 'X-ray', value: 85, color: '#06b6d4' },
              { label: 'MRI', value: 90, color: '#10b981' },
              { label: 'Reports', value: 75, color: '#f59e0b' },
            ])}
          </div>
        )
      }
      if (q.id === 'informed_consent') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Transparency level</div>
            {renderStackedBar([
              { label: 'Full disclosure', color: 'bg-green-500/70', pct: 100 },
            ])}
          </div>
        )
      }
      if (q.id === 'privacy') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Data security</div>
            {renderStackedBar([
              { label: 'Confidential', color: 'bg-blue-600/70', pct: 100 },
            ])}
          </div>
        )
      }
      if (q.id === 'contact_options') {
        return (
          <div className="flex items-center gap-3">
            {renderDonut([
              { color: '#25d366', pct: 45, label: 'WhatsApp' },
              { color: '#06b6d4', pct: 35, label: 'Phone' },
              { color: '#f59e0b', pct: 20, label: 'Email' },
            ])}
            <div className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400">
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#25d366' }} />WhatsApp ~45%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#06b6d4' }} />Phone ~35%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#f59e0b' }} />Email ~20%</div>
            </div>
          </div>
        )
      }
      if (q.id === 'prep') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Preparation checklist</div>
            {renderStackedBar([
              { label: 'Comfortable clothing', color: 'bg-blue-500/70', pct: 30 },
              { label: 'Symptoms list', color: 'bg-green-500/70', pct: 30 },
              { label: 'Prior records', color: 'bg-orange-500/70', pct: 40 },
            ])}
          </div>
        )
      }
      if (q.id === 'after_visit') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Post-visit components</div>
            {renderStackedBar([
              { label: 'Care plan', color: 'bg-emerald-500/70', pct: 40 },
              { label: 'Exercises', color: 'bg-cyan-500/70', pct: 30 },
              { label: 'Follow-ups', color: 'bg-teal-500/70', pct: 30 },
            ])}
          </div>
        )
      }
      if (q.id === 'fees') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Pricing transparency</div>
            {renderStackedBar([
              { label: 'Clear pricing', color: 'bg-green-500/70', pct: 100 },
            ])}
          </div>
        )
      }
      if (q.id === 'insurance') {
        return (
          <div className="flex items-center gap-3">
            {renderDonut([
              { color: '#10b981', pct: 60, label: 'Direct pay' },
              { color: '#f59e0b', pct: 40, label: 'Reimbursement' },
            ])}
            <div className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400">
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#10b981' }} />Direct ~60%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#f59e0b' }} />Reimburse ~40%</div>
            </div>
          </div>
        )
      }
      if (q.id === 'not_treated') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Referral conditions</div>
            {renderBars([
              { label: 'Fracture', value: 100, color: '#ef4444' },
              { label: 'Infection', value: 100, color: '#f59e0b' },
              { label: 'Emergency', value: 100, color: '#dc2626' },
            ])}
          </div>
        )
      }

      // BOOKING QUESTIONS
      if (q.id === 'booking') {
        return (
          <div className="flex items-center gap-3">
            {renderDonut([
              { color: '#10b981', pct: 40, label: 'Chat' },
              { color: '#06b6d4', pct: 40, label: 'Phone' },
              { color: '#14b8a6', pct: 20, label: 'Form' },
            ])}
            <div className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400">
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#10b981' }} />Chat ~40%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#06b6d4' }} />Phone ~40%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#14b8a6' }} />Form ~20%</div>
            </div>
          </div>
        )
      }
      if (q.id === 'same_day') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Same-day availability</div>
            {renderBars([
              { label: 'Morning', value: 85, color: '#10b981' },
              { label: 'Noon', value: 65, color: '#f59e0b' },
              { label: 'Evening', value: 45, color: '#ef4444' },
            ])}
          </div>
        )
      }
      if (q.id === 'reschedule') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Reschedule ease</div>
            {renderStackedBar([
              { label: 'Flexible', color: 'bg-green-500/70', pct: 100 },
            ])}
          </div>
        )
      }
      if (q.id === 'intake') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Form time required</div>
            {renderBars([
              { label: 'Brief', value: 30, color: '#10b981' },
              { label: '5-10 min', value: 70, color: '#06b6d4' },
            ])}
          </div>
        )
      }
      if (q.id === 'video') {
        return (
          <div className="flex items-center gap-3">
            {renderDonut([
              { color: '#10b981', pct: 35, label: 'Video' },
              { color: '#06b6d4', pct: 65, label: 'In-person' },
            ])}
            <div className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400">
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#10b981' }} />Video ~35%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#06b6d4' }} />In-person ~65%</div>
            </div>
          </div>
        )
      }
      if (q.id === 'reminders') {
        return (
          <div className="flex items-center gap-3">
            {renderDonut([
              { color: '#25d366', pct: 50, label: 'WhatsApp' },
              { color: '#06b6d4', pct: 30, label: 'SMS' },
              { color: '#f59e0b', pct: 20, label: 'Email' },
            ])}
            <div className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400">
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#25d366' }} />WhatsApp ~50%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#06b6d4' }} />SMS ~30%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#f59e0b' }} />Email ~20%</div>
            </div>
          </div>
        )
      }
      if (q.id === 'duration_booking') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Session duration (minutes)</div>
            {renderBars([
              { label: 'Initial', value: 90, color: '#10b981' },
              { label: 'Follow-up', value: 45, color: '#06b6d4' },
            ])}
          </div>
        )
      }
      if (q.id === 'documents') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Important documents</div>
            {renderStackedBar([
              { label: 'ID', color: 'bg-blue-500/70', pct: 25 },
              { label: 'Imaging', color: 'bg-green-500/70', pct: 35 },
              { label: 'Meds list', color: 'bg-orange-500/70', pct: 25 },
              { label: 'Referrals', color: 'bg-purple-500/70', pct: 15 },
            ])}
          </div>
        )
      }
      if (q.id === 'eligibility') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Suitability rate</div>
            {renderStackedBar([
              { label: 'Suitable cases', color: 'bg-green-500/70', pct: 85 },
              { label: 'Referrals', color: 'bg-orange-500/70', pct: 15 },
            ])}
          </div>
        )
      }
      if (q.id === 'family') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Family support welcome</div>
            {renderStackedBar([
              { label: 'One person', color: 'bg-green-500/70', pct: 100 },
            ])}
          </div>
        )
      }
      if (q.id === 'cancellation') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Notice importance</div>
            {renderStackedBar([
              { label: 'Early notice', color: 'bg-green-500/70', pct: 70 },
              { label: 'Efficiency', color: 'bg-blue-500/70', pct: 30 },
            ])}
          </div>
        )
      }
      if (q.id === 'booking_ahead') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Optimal booking lead time (days)</div>
            {renderBars([
              { label: 'Same', value: 40, color: '#f59e0b' },
              { label: '2-5', value: 85, color: '#10b981' },
              { label: '7+', value: 95, color: '#06b6d4' },
            ])}
          </div>
        )
      }

      // TREATMENT QUESTIONS
      if (q.id === 'gonstead') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Technique precision</div>
            {renderStackedBar([
              { label: 'Analysis', color: 'bg-blue-500/70', pct: 40 },
              { label: 'Adjustment', color: 'bg-green-500/70', pct: 35 },
              { label: 'Verification', color: 'bg-orange-500/70', pct: 25 },
            ])}
          </div>
        )
      }
      if (q.id === 'first_visit') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">First visit breakdown</div>
            {renderStackedBar([
              { label: 'History', color: 'bg-blue-500/70', pct: 30 },
              { label: 'Assessment', color: 'bg-green-500/70', pct: 40 },
              { label: 'Treatment', color: 'bg-orange-500/70', pct: 30 },
            ])}
          </div>
        )
      }
      if (q.id === 'xray') {
        return (
          <div className="flex items-center gap-3">
            {renderDonut([
              { color: '#10b981', pct: 30, label: 'Need X-ray' },
              { color: '#06b6d4', pct: 70, label: 'No X-ray' },
            ])}
            <div className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400">
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#10b981' }} />Need X-ray ~30%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#06b6d4' }} />No X-ray ~70%</div>
            </div>
          </div>
        )
      }
      if (q.id === 'sessions') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Typical session count</div>
            {renderBars([
              { label: '1-3', value: 50, color: '#10b981' },
              { label: '4-6', value: 70, color: '#06b6d4' },
              { label: '7-12', value: 90, color: '#f59e0b' },
            ])}
          </div>
        )
      }
      if (q.id === 'adjustment_feel') {
        return (
          <div className="flex items-center gap-3">
            {renderDonut([
              { color: '#10b981', pct: 80, label: 'Relief' },
              { color: '#f59e0b', pct: 15, label: 'Mild soreness' },
              { color: '#94a3b8', pct: 5, label: 'Neutral' },
            ])}
            <div className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400">
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#10b981' }} />Relief ~80%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#f59e0b' }} />Mild soreness ~15%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#94a3b8' }} />Neutral ~5%</div>
            </div>
          </div>
        )
      }
      if (q.id === 'safety') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Safety level</div>
            {renderStackedBar([
              { label: 'Exceptionally safe', color: 'bg-green-600/70', pct: 100 },
            ])}
          </div>
        )
      }
      if (q.id === 'aftercare') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Aftercare priorities</div>
            {renderStackedBar([
              { label: 'Hydration', color: 'bg-blue-500/70', pct: 30 },
              { label: 'Rest', color: 'bg-green-500/70', pct: 35 },
              { label: 'Ice/posture', color: 'bg-orange-500/70', pct: 35 },
            ])}
          </div>
        )
      }
      if (q.id === 'exercise') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Exercise components</div>
            {renderStackedBar([
              { label: 'Mobility', color: 'bg-cyan-500/70', pct: 35 },
              { label: 'Stabilization', color: 'bg-emerald-500/70', pct: 35 },
              { label: 'Ergonomics', color: 'bg-teal-500/70', pct: 30 },
            ])}
          </div>
        )
      }
      if (q.id === 'followup') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Follow-up frequency timeline</div>
            {renderBars([
              { label: 'Week 1-2', value: 90, color: '#10b981' },
              { label: 'Week 3-4', value: 60, color: '#06b6d4' },
              { label: 'Month 2+', value: 30, color: '#f59e0b' },
            ])}
          </div>
        )
      }
      if (q.id === 'kids') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Pediatric care gentleness</div>
            {renderStackedBar([
              { label: 'Very gentle', color: 'bg-green-500/70', pct: 100 },
            ])}
          </div>
        )
      }
      if (q.id === 'older_adults') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Adapted for seniors</div>
            {renderStackedBar([
              { label: 'Gentle & safe', color: 'bg-blue-500/70', pct: 100 },
            ])}
          </div>
        )
      }
      if (q.id === 'pregnancy') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Pregnancy-safe modifications</div>
            {renderStackedBar([
              { label: 'Modified', color: 'bg-pink-500/70', pct: 100 },
            ])}
          </div>
        )
      }
      if (q.id === 'contra') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Screening thoroughness</div>
            {renderStackedBar([
              { label: 'Comprehensive screening', color: 'bg-blue-600/70', pct: 100 },
            ])}
          </div>
        )
      }
      if (q.id === 'duration') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Session lengths (minutes)</div>
            {renderBars([
              { label: 'Initial', value: 75, color: '#10b981' },
              { label: 'Follow-up', value: 32, color: '#06b6d4' },
            ])}
          </div>
        )
      }
      if (q.id === 'manual_vs_machine') {
        return (
          <div className="flex items-center gap-3">
            {renderDonut([
              { color: '#10b981', pct: 60, label: 'Manual' },
              { color: '#06b6d4', pct: 40, label: 'Machine-assisted' },
            ])}
            <div className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400">
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#10b981' }} />Manual ~60%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#06b6d4' }} />Machine ~40%</div>
            </div>
          </div>
        )
      }
      if (q.id === 'side_effects') {
        return (
          <div className="flex items-center gap-3">
            {renderDonut([
              { color: '#10b981', pct: 85, label: 'None' },
              { color: '#f59e0b', pct: 15, label: 'Mild soreness' },
            ])}
            <div className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400">
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#10b981' }} />None ~85%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#f59e0b' }} />Mild ~15%</div>
            </div>
          </div>
        )
      }
      if (q.id === 'after_soreness') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Soreness duration (hours)</div>
            {renderBars([
              { label: '0-24h', value: 60, color: '#f59e0b' },
              { label: '24-48h', value: 30, color: '#10b981' },
              { label: '48h+', value: 10, color: '#06b6d4' },
            ])}
          </div>
        )
      }
      if (q.id === 'heat_vs_ice') {
        return (
          <div className="flex items-center gap-3">
            {renderDonut([
              { color: '#06b6d4', pct: 60, label: 'Ice first' },
              { color: '#f59e0b', pct: 40, label: 'Heat later' },
            ])}
            <div className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400">
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#06b6d4' }} />Ice first ~60%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#f59e0b' }} />Heat later ~40%</div>
            </div>
          </div>
        )
      }
      if (q.id === 'cracking') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">What causes the sound</div>
            {renderStackedBar([
              { label: 'Gas cavitation', color: 'bg-blue-500/70', pct: 100 },
            ])}
          </div>
        )
      }
      if (q.id === 'exercise_freq') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Recommended frequency</div>
            {renderBars([
              { label: 'Daily', value: 100, color: '#10b981' },
              { label: 'Progress', value: 75, color: '#06b6d4' },
            ])}
          </div>
        )
      }
      if (q.id === 'timeline') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Relief timeline (visits)</div>
            {renderBars([
              { label: '1-3', value: 65, color: '#10b981' },
              { label: '4-6', value: 85, color: '#06b6d4' },
              { label: '7-12', value: 95, color: '#f59e0b' },
            ])}
          </div>
        )
      }

      // CONDITIONS QUESTIONS
      if (q.id === 'disc_herniation') {
        return (
          <div className="flex items-center gap-3">
            {renderDonut([
              { color: '#10b981', pct: 60, label: 'Disc' },
              { color: '#06b6d4', pct: 25, label: 'Facet' },
              { color: '#f59e0b', pct: 15, label: 'SI/Other' },
            ])}
            <div className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400">
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#10b981' }} />Disc ~60%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#06b6d4' }} />Facet ~25%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#f59e0b' }} />SI/Other ~15%</div>
            </div>
          </div>
        )
      }
      if (q.id === 'sciatica') {
        return (
          <div className="flex items-center gap-3">
            {renderDonut([
              { color: '#10b981', pct: 50, label: 'Disc' },
              { color: '#06b6d4', pct: 20, label: 'SI' },
              { color: '#f59e0b', pct: 15, label: 'Piriformis' },
              { color: '#94a3b8', pct: 15, label: 'Other' },
            ])}
            <div className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400">
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#10b981' }} />Disc ~50%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#06b6d4' }} />SI ~20%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#f59e0b' }} />Piriformis ~15%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#94a3b8' }} />Other ~15%</div>
            </div>
          </div>
        )
      }
      if (q.id === 'low_back_pain') {
        return (
          <div className="flex items-center gap-3">
            {renderDonut([
              { color: '#10b981', pct: 45, label: 'Facet/SI' },
              { color: '#06b6d4', pct: 35, label: 'Disc' },
              { color: '#f59e0b', pct: 20, label: 'Muscle' },
            ])}
            <div className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400">
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#10b981' }} />Facet/SI ~45%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#06b6d4' }} />Disc ~35%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#f59e0b' }} />Muscle ~20%</div>
            </div>
          </div>
        )
      }
      if (q.id === 'neck_pain') {
        return (
          <div className="flex items-center gap-3">
            {renderDonut([
              { color: '#10b981', pct: 50, label: 'Posture' },
              { color: '#06b6d4', pct: 30, label: 'Facet' },
              { color: '#f59e0b', pct: 20, label: 'Muscle' },
            ])}
            <div className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400">
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#10b981' }} />Posture ~50%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#06b6d4' }} />Facet ~30%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#f59e0b' }} />Muscle ~20%</div>
            </div>
          </div>
        )
      }
      if (q.id === 'headache') {
        return (
          <div className="flex items-center gap-3">
            {renderDonut([
              { color: '#10b981', pct: 55, label: 'Cervicogenic' },
              { color: '#06b6d4', pct: 25, label: 'Tension' },
              { color: '#f59e0b', pct: 20, label: 'Migraine' },
            ])}
            <div className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400">
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#10b981' }} />Cervico ~55%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#06b6d4' }} />Tension ~25%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#f59e0b' }} />Migraine ~20%</div>
            </div>
          </div>
        )
      }
      if (q.id === 'mid_back') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Treatment approach</div>
            {renderStackedBar([
              { label: 'Adjustments', color: 'bg-emerald-500/70', pct: 50 },
              { label: 'Mobility', color: 'bg-cyan-500/70', pct: 30 },
              { label: 'Breathing', color: 'bg-teal-500/70', pct: 20 },
            ])}
          </div>
        )
      }
      if (q.id === 'shoulder') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Assessment areas</div>
            {renderStackedBar([
              { label: 'Neck', color: 'bg-blue-500/70', pct: 35 },
              { label: 'Upper back', color: 'bg-green-500/70', pct: 35 },
              { label: 'Shoulder', color: 'bg-orange-500/70', pct: 30 },
            ])}
          </div>
        )
      }
      if (q.id === 'knee') {
        return (
          <div className="flex items-center gap-3">
            {renderDonut([
              { color: '#10b981', pct: 40, label: 'Hip mechanics' },
              { color: '#06b6d4', pct: 30, label: 'Ankle' },
              { color: '#f59e0b', pct: 30, label: 'Knee direct' },
            ])}
            <div className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400">
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#10b981' }} />Hip ~40%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#06b6d4' }} />Ankle ~30%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#f59e0b' }} />Knee ~30%</div>
            </div>
          </div>
        )
      }
      if (q.id === 'posture') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Posture improvement components</div>
            {renderStackedBar([
              { label: 'Adjustments', color: 'bg-emerald-500/70', pct: 40 },
              { label: 'Ergonomics', color: 'bg-cyan-500/70', pct: 30 },
              { label: 'Exercises', color: 'bg-teal-500/70', pct: 30 },
            ])}
          </div>
        )
      }
      if (q.id === 'sports') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Sports care focus</div>
            {renderStackedBar([
              { label: 'Alignment', color: 'bg-emerald-500/70', pct: 35 },
              { label: 'Load mgmt', color: 'bg-cyan-500/70', pct: 35 },
              { label: 'Return-to-play', color: 'bg-teal-500/70', pct: 30 },
            ])}
          </div>
        )
      }
      if (q.id === 'pinched_nerve') {
        return (
          <div className="flex items-center gap-3">
            {renderDonut([
              { color: '#10b981', pct: 65, label: 'Joint/disc' },
              { color: '#06b6d4', pct: 35, label: 'Other' },
            ])}
            <div className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400">
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#10b981' }} />Joint/disc ~65%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#06b6d4' }} />Other ~35%</div>
            </div>
          </div>
        )
      }
      if (q.id === 'tmj') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">TMJ care approach</div>
            {renderStackedBar([
              { label: 'Neck care', color: 'bg-blue-500/70', pct: 40 },
              { label: 'Jaw techniques', color: 'bg-green-500/70', pct: 35 },
              { label: 'Habit changes', color: 'bg-orange-500/70', pct: 25 },
            ])}
          </div>
        )
      }
      if (q.id === 'preg_back') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Pregnancy care safety</div>
            {renderStackedBar([
              { label: 'Gentle & safe', color: 'bg-pink-500/70', pct: 100 },
            ])}
          </div>
        )
      }
      if (q.id === 'post_surgery') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Post-surgery focus</div>
            {renderStackedBar([
              { label: 'Mobility', color: 'bg-cyan-500/70', pct: 35 },
              { label: 'Alignment', color: 'bg-emerald-500/70', pct: 35 },
              { label: 'Function', color: 'bg-teal-500/70', pct: 30 },
            ])}
          </div>
        )
      }
      if (q.id === 'numb_tingling') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Assessment thoroughness</div>
            {renderStackedBar([
              { label: 'Comprehensive', color: 'bg-blue-600/70', pct: 100 },
            ])}
          </div>
        )
      }
      if (q.id === 'desk') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Desk job relief strategy</div>
            {renderStackedBar([
              { label: 'Ergonomics', color: 'bg-emerald-500/70', pct: 40 },
              { label: 'Micro-breaks', color: 'bg-cyan-500/70', pct: 35 },
              { label: 'Care', color: 'bg-teal-500/70', pct: 25 },
            ])}
          </div>
        )
      }
      if (q.id === 'desk_setup') {
        return (
          <div>
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Impact breakdown</div>
            {renderStackedBar([
              { label: 'Ergonomics', color: 'bg-emerald-500/70', pct: 45 },
              { label: 'Breaks', color: 'bg-cyan-500/70', pct: 35 },
              { label: 'Habits', color: 'bg-teal-500/70', pct: 20 },
            ])}
          </div>
        )
      }
      if (q.id === 'sleep') {
        return (
          <div className="flex items-center gap-3">
            {renderDonut([
              { color: '#10b981', pct: 50, label: 'Side' },
              { color: '#06b6d4', pct: 40, label: 'Back' },
              { color: '#ef4444', pct: 10, label: 'Avoid stomach' },
            ])}
            <div className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400">
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#10b981' }} />Side ~50%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#06b6d4' }} />Back ~40%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#ef4444' }} />Stomach ✗ ~10%</div>
            </div>
          </div>
        )
      }
      if (q.id === 'mattress') {
        return (
          <div className="flex items-center gap-3">
            {renderDonut([
              { color: '#10b981', pct: 70, label: 'Medium-firm' },
              { color: '#06b6d4', pct: 20, label: 'Firm' },
              { color: '#f59e0b', pct: 10, label: 'Soft' },
            ])}
            <div className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400">
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#10b981' }} />Med-firm ~70%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#06b6d4' }} />Firm ~20%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#f59e0b' }} />Soft ~10%</div>
            </div>
          </div>
        )
      }
      if (q.id === 'foot') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Chain effect impact</div>
            {renderStackedBar([
              { label: 'Foot', color: 'bg-blue-500/70', pct: 25 },
              { label: 'Ankle/Knee', color: 'bg-green-500/70', pct: 35 },
              { label: 'Hip/Back', color: 'bg-orange-500/70', pct: 40 },
            ])}
          </div>
        )
      }
      if (q.id === 'lifting') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Safe lifting principles</div>
            {renderStackedBar([
              { label: 'Neutral spine', color: 'bg-emerald-500/70', pct: 30 },
              { label: 'Hip hinge', color: 'bg-cyan-500/70', pct: 30 },
              { label: 'Load close', color: 'bg-teal-500/70', pct: 25 },
              { label: 'No twisting', color: 'bg-rose-500/70', pct: 15 },
            ])}
          </div>
        )
      }
      if (q.id === 'hydration') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Wellness components</div>
            {renderStackedBar([
              { label: 'Hydration', color: 'bg-blue-500/70', pct: 35 },
              { label: 'Nutrition', color: 'bg-green-500/70', pct: 35 },
              { label: 'Sleep', color: 'bg-purple-500/70', pct: 30 },
            ])}
          </div>
        )
      }
      if (q.id === 'stress') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Stress management</div>
            {renderStackedBar([
              { label: 'Care', color: 'bg-emerald-500/70', pct: 30 },
              { label: 'Breathing', color: 'bg-cyan-500/70', pct: 25 },
              { label: 'Movement', color: 'bg-teal-500/70', pct: 25 },
              { label: 'Sleep', color: 'bg-indigo-500/70', pct: 20 },
            ])}
          </div>
        )
      }

      // NEW ESSENTIAL FAQs GRAPHS
      if (q.id === 'what_is_chiropractic') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Core practice areas</div>
            {renderStackedBar([
              { label: 'Diagnosis', color: 'bg-blue-500/70', pct: 30 },
              { label: 'Treatment', color: 'bg-emerald-500/70', pct: 40 },
              { label: 'Prevention', color: 'bg-cyan-500/70', pct: 30 },
            ])}
          </div>
        )
      }
      if (q.id === 'dr_bashir_qualifications') {
        return (
          <div className="flex items-center gap-3">
            {renderDonut([
              { color: '#10b981', pct: 40, label: 'Certification' },
              { color: '#06b6d4', pct: 35, label: 'Experience' },
              { color: '#f59e0b', pct: 25, label: 'Philosophy' },
            ])}
            <div className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400">
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#10b981' }} />Level V ~40%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#06b6d4' }} />Experience ~35%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#f59e0b' }} />Philosophy ~25%</div>
            </div>
          </div>
        )
      }
      if (q.id === 'difference_gonstead') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Gonstead advantages</div>
            {renderStackedBar([
              { label: '5-criteria analysis', color: 'bg-blue-500/70', pct: 35 },
              { label: 'Precision', color: 'bg-emerald-500/70', pct: 40 },
              { label: 'Outcomes', color: 'bg-cyan-500/70', pct: 25 },
            ])}
          </div>
        )
      }
      if (q.id === 'acute_vs_chronic') {
        return (
          <div className="flex items-center gap-3">
            {renderDonut([
              { color: '#10b981', pct: 35, label: 'Acute' },
              { color: '#06b6d4', pct: 40, label: 'Chronic' },
              { color: '#f59e0b', pct: 25, label: 'Maintenance' },
            ])}
            <div className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400">
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#10b981' }} />Acute ~35%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#06b6d4' }} />Chronic ~40%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#f59e0b' }} />Maintenance ~25%</div>
            </div>
          </div>
        )
      }
      if (q.id === 'chiro_vs_physio') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Integrated approach</div>
            {renderStackedBar([
              { label: 'Chiropractic', color: 'bg-emerald-500/70', pct: 50 },
              { label: 'Rehab exercises', color: 'bg-cyan-500/70', pct: 30 },
              { label: 'Education', color: 'bg-teal-500/70', pct: 20 },
            ])}
          </div>
        )
      }
      if (q.id === 'success_rate') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Success rates by type</div>
            {renderBars([
              { label: 'Acute', value: 85, color: '#10b981' },
              { label: 'Chronic', value: 75, color: '#06b6d4' },
              { label: 'Complex', value: 65, color: '#f59e0b' },
            ])}
          </div>
        )
      }
      if (q.id === 'multiple_problems') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Treatment strategy</div>
            {renderStackedBar([
              { label: 'Primary issue', color: 'bg-emerald-500/70', pct: 50 },
              { label: 'Secondary', color: 'bg-cyan-500/70', pct: 30 },
              { label: 'Holistic view', color: 'bg-teal-500/70', pct: 20 },
            ])}
          </div>
        )
      }
      if (q.id === 'lifestyle_advice') {
        return (
          <div className="flex items-center gap-3">
            {renderDonut([
              { color: '#10b981', pct: 30, label: 'Ergonomics' },
              { color: '#06b6d4', pct: 25, label: 'Movement' },
              { color: '#f59e0b', pct: 25, label: 'Nutrition' },
              { color: '#8b5cf6', pct: 20, label: 'Stress/Sleep' },
            ])}
            <div className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400">
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#10b981' }} />Ergonomics ~30%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#06b6d4' }} />Movement ~25%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#f59e0b' }} />Nutrition ~25%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#8b5cf6' }} />Stress ~20%</div>
            </div>
          </div>
        )
      }
      if (q.id === 'pain_free_adjustment') {
        return (
          <div className="flex items-center gap-3">
            {renderDonut([
              { color: '#10b981', pct: 40, label: 'Wellness' },
              { color: '#06b6d4', pct: 60, label: 'When needed' },
            ])}
            <div className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400">
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#10b981' }} />Wellness ~40%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#06b6d4' }} />When needed ~60%</div>
            </div>
          </div>
        )
      }
      if (q.id === 'bring_someone') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Companion benefits</div>
            {renderStackedBar([
              { label: 'Support', color: 'bg-emerald-500/70', pct: 40 },
              { label: 'Understanding', color: 'bg-cyan-500/70', pct: 35 },
              { label: 'Assistance', color: 'bg-teal-500/70', pct: 25 },
            ])}
          </div>
        )
      }
      if (q.id === 'what_to_wear') {
        return (
          <div className="flex items-center gap-3">
            {renderDonut([
              { color: '#10b981', pct: 60, label: 'Athletic wear' },
              { color: '#06b6d4', pct: 40, label: 'Loose casual' },
            ])}
            <div className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400">
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#10b981' }} />Athletic ~60%</div>
              <div><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: '#06b6d4' }} />Casual ~40%</div>
            </div>
          </div>
        )
      }
      if (q.id === 'age_limits') {
        return (
          <div className="space-y-2">
            <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400 mb-1">Age group distribution</div>
            {renderBars([
              { label: '0-3', value: 15, color: '#ec4899' },
              { label: '4-18', value: 25, color: '#10b981' },
              { label: '19-64', value: 45, color: '#06b6d4' },
              { label: '65+', value: 15, color: '#f59e0b' },
            ])}
          </div>
        )
      }
      return null
    }

    return (
      <details className="group rounded-lg border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/60 p-2.5 open:shadow-sm">
        <summary className="flex items-center gap-2 cursor-pointer select-none">
          <span className="inline-flex items-center justify-center rounded-md bg-[rgb(66,139,124)]/10 text-[rgb(66,139,124)] p-1">
            <BarChart3 className="h-3.5 w-3.5" />
          </span>
          <span className="text-[13px] md:text-sm font-semibold text-[rgb(66,139,124)]">{language === 'ur' ? 'بصری جائزہ' : 'Visual overview'}</span>
        </summary>
        <div className="mt-2 space-y-3">
          {(cat === 'conditions' || cat === 'treatment') && (
            <div>
              <div className="flex items-center justify-between">
                <div className="text-[12px] md:text-xs text-gray-600 dark:text-gray-400">{language === 'ur' ? 'کیئر مکس' : 'Care mix'}</div>
                <div className="flex items-center gap-2 text-[10px] md:text-[11px]">
                  <span className="inline-flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500/70 rounded-sm" />Treatment</span>
                  <span className="inline-flex items-center gap-1"><span className="w-2 h-2 bg-cyan-500/70 rounded-sm" />Exercises</span>
                  <span className="inline-flex items-center gap-1"><span className="w-2 h-2 bg-teal-500/70 rounded-sm" />Aftercare</span>
                  <span className="inline-flex items-center gap-1"><span className="w-2 h-2 bg-rose-500/70 rounded-sm" />Alerts</span>
                </div>
              </div>
              <div className="mt-1">{renderStackedBar(buildCareMix(q))}</div>
            </div>
          )}
          {(cat === 'conditions' || cat === 'treatment') && (
            <div>
              <div className="flex items-center gap-2 text-[12px] md:text-xs text-gray-600 dark:text-gray-400"><LineChart className="h-3.5 w-3.5" />{language === 'ur' ? 'عام بہتری کا رجحان' : 'Typical improvement trend'}</div>
              {renderSparkline()}
            </div>
          )}
          {(cat === 'booking' || cat === 'clinic') && (
            <div>
              <div className="flex items-center gap-2 text-[12px] md:text-xs text-gray-600 dark:text-gray-400"><LineChart className="h-3.5 w-3.5" />{language === 'ur' ? 'عمل کے مراحل' : 'Process steps'}</div>
              {renderStepper(cat === 'booking' ? ['Choose channel', 'Provide details', 'Confirm time', 'Reminder'] : ['Find info', 'Prepare', 'Visit/Contact'])}
            </div>
          )}
          {custom()}
        </div>
      </details>
    )
  }

  const renderAnswerView = (q: QQ) => {
    const summary = getSummary(q)
    const sections = (q.sections && q.sections.length ? q.sections : getSections(q))
    const iconFor = (title: string) => {
      const t = title.toLowerCase()
      if (t.includes('exercise')) return <Dumbbell className="h-3.5 w-3.5" />
      if (t.includes('treatment') || t.includes('plan') || t.includes('approach') || t.includes('care')) return <Activity className="h-3.5 w-3.5" />
      if (t.includes('when to seek') || t.includes('red') || t.includes('urgent')) return <AlertTriangle className="h-3.5 w-3.5" />
      if (t.includes('aftercare') || t.includes('tips') || t.includes('self') || t.includes('habits')) return <FileCheck className="h-3.5 w-3.5" />
      if (t.includes('overview') || t.includes('why') || t.includes('contributors') || t.includes('causes')) return <Info className="h-3.5 w-3.5" />
      return <ClipboardList className="h-3.5 w-3.5" />
    }
    return (
      <div className="w-full">
        <p className="mt-1 text-[12px] sm:text-[13px] md:text-sm leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300">{summary}</p>
        {sections && sections.length > 0 && (
          <div className="mt-3 space-y-2 sm:space-y-2.5">
            {sections.map((sec, idx) => {
              const sectionTitle = (language === 'ur' && sec.titleUr) ? sec.titleUr : sec.title
              const sectionItems = (language === 'ur' && sec.itemsUr) ? sec.itemsUr : sec.items
              return (
                <details key={idx} className="group rounded-lg border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/60 p-2 sm:p-2.5 open:shadow-sm transition-all" open={expandAll}>
                  <summary className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-gray-800/50 -m-2 sm:-m-2.5 p-2 sm:p-2.5 rounded-md transition-colors">
                    <span className="inline-flex items-center justify-center flex-shrink-0 rounded-md bg-[rgb(66,139,124)]/10 text-[rgb(66,139,124)] p-1 min-w-[28px] min-h-[28px]">
                      {iconFor(sec.title)}
                    </span>
                    <span className="text-[12px] sm:text-[13px] md:text-sm font-semibold text-[rgb(66,139,124)] flex-1">{sectionTitle}</span>
                  </summary>
                  <ul className="mt-2 list-disc pl-4 sm:pl-5 space-y-1 sm:space-y-1.5 text-[12px] sm:text-[13px] md:text-sm text-gray-600 dark:text-gray-400">
                    {sectionItems.map((it, i) => (<li key={i} className="leading-relaxed">{it}</li>))}
                  </ul>
                </details>
              )
            })}
            <div className="mt-2 sm:mt-3">{renderVisuals(q)}</div>
          </div>
        )}
      </div>
    )
  }

  const sendFaqToChat = (q: QQ) => {
    const title = language === 'ur' && q.labelUr ? q.labelUr : q.label
    const answer = language === 'ur' && q.answerUr ? q.answerUr : q.answer
    const userMsg: Message = { id: `${Date.now()}_u`, text: title, sender: 'user', timestamp: new Date() }
    const botMsg: Message = { id: `${Date.now()}_b`, text: answer, sender: 'bot', timestamp: new Date() }
    setMessages(prev => [...prev, userMsg, botMsg])
    analyticsRef.current?.trackEvent('faq_send_to_chat', { id: q.id })
    setShowQuick(false)
  }

  const handleQuickPick = async (id: string) => {
    const item = quickQuestions.find(q => q.id === id)
    if (!item) return
    analyticsRef.current?.trackEvent('chat_quick_reply', { id })

    const userMsg: Message = {
      id: `${Date.now()}_u`,
      text: language === 'ur' && item.labelUr ? item.labelUr : item.label,
      sender: 'user',
      timestamp: new Date()
    }
    const botMsg: Message = {
      id: `${Date.now()}_b`,
      text: language === 'ur' && item.answerUr ? item.answerUr : item.answer,
      sender: 'bot',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMsg, botMsg])

  }

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const analyticsRef = useRef<AnalyticsTracker | null>(null)
  const prevFocusRef = useRef<HTMLElement | null>(null)

  // Simple highlight for search matches
  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const highlight = (text: string, query: string): React.ReactNode => {
    if (!query) return text
    try {
      const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, 'ig'))
      return parts.map((part, i) => (
        part.toLowerCase() === query.toLowerCase()
          ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-600/40 text-inherit rounded px-0.5">{part}</mark>
          : <span key={i}>{part}</span>
      ))
    } catch {
      return text
    }
  }

  // Init analytics (client-only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      analyticsRef.current = new AnalyticsTracker()
    }
  }, [])

  // Limit messages for performance
  useEffect(() => {
    setMessages(prev => prev.length > 100 ? prev.slice(prev.length - 100) : prev)
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Compact mode on very small viewports
  useEffect(() => {
    const update = () => {
      const narrow = typeof window !== 'undefined' && (window.innerWidth < 380 || window.innerHeight < 600)
      setIsNarrow(!!narrow)
      setCompact(!!narrow)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Simple intent-based suggestions (updates as user types)
  const [suggestedIds, setSuggestedIds] = useState<string[]>([])
  useEffect(() => {
    const text = inputMessage.toLowerCase()
    const ids: string[] = []
    if (/(book|appointment|schedule|اپائنٹمنٹ|بک)/.test(text)) ids.push('booking', 'hours')
    if (/(where|location|map|کہاں)/.test(text)) ids.push('location')
    if (/(sciatica|sciatic|leg|سائٹیکا)/.test(text)) ids.push('sciatica')
    if (/(back|lower|lumbar|کمر|پیٹھ)/.test(text)) ids.push('low_back_pain')
    if (/(neck|cervical|گردن)/.test(text)) ids.push('neck_pain')
    if (/(headache|migraine|سر درد)/.test(text)) ids.push('headache')
    if (/(posture|sit|stand|پوسچر|بیٹھنا|کھڑا)/.test(text)) ids.push('posture')
    if (/(sleep|sleeping|position|نیند|سونا)/.test(text)) ids.push('sleep')
    if (/(x\s?-?ray|xray|ایکس رے)/.test(text)) ids.push('xray')
    if (/(pay|payment|easypaisa|jazzcash|ادائیگی|فیس)/.test(text)) ids.push('payments')
    if (/(reschedule|cancel|change|تبدیل|منسوخ)/.test(text)) ids.push('reschedule')
    setSuggestedIds(Array.from(new Set(ids)).slice(0, 3))
  }, [inputMessage])


  const processAppointmentBooking = (userMessage: string): string => {
    const message = userMessage.toLowerCase()

    if (!appointmentBooking) {
      // Start booking process
      setAppointmentBooking({ step: 1 })
      return "Great! I'll help you book an appointment with Bashir Khan Chiropractic. Let's start with your full name. What's your name?"
    }

    switch (appointmentBooking.step) {
      case 1: // Getting name
        setAppointmentBooking(prev => ({ ...prev!, name: userMessage, step: 2 }))
        return `Thank you, ${userMessage}! Now I need your phone number for appointment confirmation. Please provide your mobile number.`

      case 2: // Getting phone
        const phoneRegex = /^(\+92|0)?3[0-9]{9}$/
        if (!phoneRegex.test(userMessage.replace(/\s/g, ''))) {
          return "Please provide a valid Pakistani mobile number (e.g., 03001234567 or +923001234567)."
        }
        setAppointmentBooking(prev => ({ ...prev!, phone: userMessage, step: 3 }))
        return "Perfect! Would you prefer an in-clinic Gonstead adjustment or a video consultation? Please type 'clinic' or 'video'."

      case 3: // Getting session type
        if (message.includes('clinic') || message.includes('office') || message.includes('visit')) {
          setAppointmentBooking(prev => ({ ...prev!, sessionType: 'in_clinic', step: 4 }))
          return "Excellent choice! In-clinic Gonstead adjustments provide the most comprehensive treatment. When would you like to schedule your appointment? Please provide your preferred date and time (e.g., 'Tomorrow 2 PM' or 'Monday 10 AM')."
        } else if (message.includes('video') || message.includes('online') || message.includes('virtual')) {
          setAppointmentBooking(prev => ({ ...prev!, sessionType: 'video', step: 4 }))
          return "Good choice for quick consultation! Video consultations are great for follow-ups and initial assessments. When would you like to schedule your video consultation? Please provide your preferred date and time."
        } else {
          return "Please choose either 'clinic' for in-person visit or 'video' for online consultation."
        }

      case 4: // Getting preferred time
        setAppointmentBooking(prev => ({ ...prev!, preferredTime: userMessage, step: 5 }))
        return "Great! Do you have any specific concerns or notes about your condition that you'd like Bashir Khan Chiropractic to know beforehand? (You can type 'none' if no specific notes)"

      case 5: // Getting notes and confirmation
        const notes = message === 'none' ? '' : userMessage
        setAppointmentBooking(prev => ({ ...prev!, notes, step: 6 }))

        const appointmentSummary = `
📋 APPOINTMENT SUMMARY:
👤 Name: ${appointmentBooking.name}
📞 Phone: ${appointmentBooking.phone}
🏥 Type: ${appointmentBooking.sessionType === 'in_clinic' ? 'In-Clinic Gonstead Adjustment' : 'Video Consultation'}
📅 Preferred Time: ${appointmentBooking.preferredTime}
📝 Notes: ${notes || 'None'}

Shall I confirm and book this appointment for you? Please type 'yes' to confirm or 'no' to cancel.`

        return appointmentSummary

      case 6: // Final confirmation
        if (message.includes('yes') || message.includes('confirm') || message.includes('book')) {
          // Reset booking state
          const bookingData = { ...appointmentBooking }
          setAppointmentBooking(null)

          // Here you would typically send the data to your backend
          console.log('Appointment booked:', bookingData)

          return `🎉 APPOINTMENT CONFIRMED! 

Dear ${bookingData.name}, your appointment has been successfully booked!

📅 Appointment Details:
• Type: ${bookingData.sessionType === 'in_clinic' ? 'In-Clinic Treatment' : 'Video Consultation'}
• Time: ${bookingData.preferredTime}
• Phone: ${bookingData.phone}

✅ What's Next:
• You'll receive a WhatsApp confirmation shortly
• Our team will contact you to confirm the exact time
• For clinic visits: Near Peshawar Model School, Tehsil Road, Nowshera

📞 Contact: +92 304 699 6267

Thank you for choosing Gonstead Chiropractic Clinic!`
        } else {
          setAppointmentBooking(null)
          return "Appointment booking cancelled. No worries! Feel free to start over anytime or contact us directly at +92 304 699 6267."
        }

      default:
        setAppointmentBooking(null)
        return "Let's start fresh. How can I help you today?"
    }
  }

  const getBotResponse = async (userMessage: string): Promise<string> => {
    const message = userMessage.toLowerCase()

    // Appointment booking conversational flow
    if (
      appointmentBooking ||
      message.includes("appointment") ||
      message.includes("book") ||
      message.includes("schedule") ||
      message.includes("اپائنٹمنٹ") ||
      message.includes("بک")
    ) {
      return processAppointmentBooking(userMessage)
    }

    // Try unified backend first
    try {
      const historyPayload = messages.map((m) => ({
        sender: m.sender,
        text: m.text,
      }))

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          history: historyPayload,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data?.text) {
        throw new Error(data?.error || "Failed to get assistant response")
      }

      return String(data.text)
    } catch (error) {
      console.error("Chat backend error:", error)
      // Fallback to local structured knowledge base
      const kbAnswer = getFallbackResponse(userMessage)
      return `${kbAnswer}\n\nThis information is general educational guidance and not a diagnosis. For a personalized assessment, please consult the clinic directly at +92 304 699 6267 or your healthcare provider.`
    }
  }

  const getFallbackResponse = (message: string): string => {
    console.warn('Fallback response used for message:', message)
    return "Right now the intelligent assistant engine is not fully connected, so I can't safely generate a detailed clinical answer. This chat is for general guidance only. For accurate advice about your specific condition, please contact Gonstead Chiropractic Clinic directly at +92 304 699 6267 or visit in person. For any emergency or severe symptoms, seek urgent medical care or call 1122."
  }


  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    const currentMessage = inputMessage
    setInputMessage("")
    setMessages((prev) => [...prev, userMessage])

    analyticsRef.current?.trackEvent('chat_send', { len: currentMessage.length })

    setIsTyping(true)
    try {
      const botText = await getBotResponse(currentMessage)
      if (botText && botText.trim()) {
        const botMessage: Message = {
          id: `${Date.now()}-bot`,
          text: botText,
          sender: "bot",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMessage])
      }
    } catch (error) {
      console.error('Advanced chatbot error:', error)
      const fallback: Message = {
        id: `${Date.now()}-error`,
        text:
          language === 'ur'
            ? 'معذرت، اس وقت سرور جواب نہیں دے سکا۔ براہِ کرم تھوڑی دیر بعد دوبارہ کوشش کریں یا براہِ راست کلینک سے رابطہ کریں: +92 304 699 6267.'
            : "Sorry, I couldn't process your request right now. Please try again shortly or contact the clinic directly at +92 304 699 6267.",
        sender: 'bot',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, fallback])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Accessibility: focus trap, focus input on open, ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false) }
    if (isOpen) {
      prevFocusRef.current = document.activeElement as HTMLElement
      setTimeout(() => {
        const el = document.querySelector<HTMLInputElement>('input[aria-label="Message input"]')
        el?.focus()
      }, 0)
      window.addEventListener('keydown', onKey)

      const container = chatbotRef.current
      const trap = (e: KeyboardEvent) => {
        if (e.key !== 'Tab' || !container) return
        const focusables = container.querySelectorAll<HTMLElement>(
          'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusables.length) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus()
        }
      }
      container?.addEventListener('keydown', trap as any)
      return () => {
        window.removeEventListener('keydown', onKey)
        container?.removeEventListener('keydown', trap as any)
        prevFocusRef.current?.focus?.()
      }
    }
    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [isOpen])

  if (!isOpen) {
    // track open intent when launcher is visible; actual open tracked on click
    return (
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[10010]">
        <Button
          aria-label="Open chat assistant"
          onClick={() => { setIsOpen(true); analyticsRef.current?.trackEvent('chat_open', {}) }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 rounded-full bg-gradient-to-br from-[rgb(0,78,108)] via-[rgb(0,92,128)] to-[rgb(0,105,147)] text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform ${isHovered ? "scale-110 opacity-100" : "scale-100 opacity-90"
            } relative overflow-hidden border-4 border-white/30 ring-4 ring-white/20`}
        >
          {/* Subtle pulse */}
          <div className="absolute inset-0 rounded-full bg-[rgb(0,78,108)]/30 animate-ping z-0"></div>
          {/* Brand logo watermark centered */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <Image
              src="/images/gonstead-logo-new.png"
              alt="Brand watermark"
              width={28}
              height={28}
              className="opacity-80 contrast-125 drop-shadow-sm"
            />
          </div>
        </Button>

        {/* Enhanced Tooltip */}
        {isHovered && (
          <div className="absolute bottom-16 md:bottom-20 right-0 bg-gradient-to-r from-gray-900 to-gray-800 text-white text-xs md:text-sm px-3 py-2 rounded-lg shadow-xl whitespace-nowrap animate-in fade-in-0 zoom-in-95 duration-200 backdrop-blur-md border border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[rgb(0,78,108)] rounded-full animate-pulse"></div>
              Chat with Gonstead Chiropractic Assistant
            </div>
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div ref={chatbotRef} className="fixed left-2 right-2 sm:left-auto sm:right-4 md:right-6 z-[10010] pb-[env(safe-area-inset-bottom)]" style={{ bottom: 'calc(env(safe-area-inset-bottom) + 16px)' }} dir={language === 'ur' ? 'rtl' : 'ltr'}>
      <Card
        className={`w-full sm:w-[360px] md:w-[400px] lg:w-[440px] xl:w-[460px] max-w-[calc(100vw-1rem)]
        shadow-sm border border-gray-200 dark:border-gray-800 transition-all duration-200 bg-white dark:bg-gray-900
        ${compact ? "h-[88dvh] sm:h-[85vh]" : "h-[82dvh] sm:h-[80vh]"}
        max-h-[calc(100dvh-2.5rem)]
        rounded-2xl overflow-hidden flex flex-col`}
      >
        {/* Enhanced Header */}
        <CardHeader className="bg-white dark:bg-gray-900 text-[rgb(66,139,124)] p-2 md:p-2 rounded-t-2xl border-b border-gray-200 dark:border-gray-800">

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-7 h-7 md:w-8 md:h-8 relative flex-shrink-0">
                <Image src="/images/gonstead-logo-new.png" alt="Gonstead Logo" fill className="object-contain filter drop-shadow-sm" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-sm md:text-base font-poppins font-semibold truncate">Bashir Khan Chiropractic Assistant</CardTitle>
              </div>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <Button size="sm" variant="ghost" onClick={() => setShowQuick(v => !v)} className="text-[rgb(66,139,124)] hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 md:p-2 rounded-md" aria-pressed={showQuick} aria-label="Toggle quick questions">
                {showQuick ? (language === 'ur' ? 'چیٹ' : 'Chat') : 'FAQ'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-red-500/20 p-1.5 md:p-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>

        </CardHeader>

        <>
          <CardContent className="p-0 flex-1 min-h-0 overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-[rgba(13,92,117,0.35)] scrollbar-track-transparent" role="log" aria-live="polite" aria-relevant="additions">
            {showQuick ? (
              <div className="p-2 md:p-3 space-y-2 md:space-y-3">
                <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 p-2 rounded-md border border-gray-200/60 dark:border-gray-800/60">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      aria-label="Search FAQs"
                      value={faqQuery}
                      onChange={(e) => setFaqQuery(e.target.value)}
                      placeholder={language === 'ur' ? 'سوال تلاش کریں…' : 'Search FAQs…'}
                      className="h-8 text-sm"
                    />
                    <div className="ml-auto flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setLanguage(language === 'ur' ? 'en' : 'ur')} className="text-[rgb(66,139,124)] hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 md:p-2 rounded-md" aria-label="Toggle language" title={language === 'ur' ? 'Switch to English' : 'اردو میں'}>
                        <Languages className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowQuick(false)} aria-label="Back to chat">{language === 'ur' ? 'چیٹ' : 'Chat'}</Button>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-1.5 overflow-x-auto no-scrollbar">
                    {(['all', 'treatment', 'conditions', 'clinic', 'booking'] as const).map((k) => (
                      <Button
                        key={k}
                        size="sm"
                        variant={selectedCategory === k ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory(k)}
                        className="text-xs"
                      >
                        {k === 'all' ? (language === 'ur' ? 'تمام' : 'All')
                          : k === 'treatment' ? (language === 'ur' ? 'علاج' : 'Treatment')
                            : k === 'conditions' ? (language === 'ur' ? 'مسائل' : 'Conditions')
                              : k === 'clinic' ? (language === 'ur' ? 'کلینک' : 'Clinic')
                                : (language === 'ur' ? 'بکنگ' : 'Booking')}
                      </Button>
                    ))}
                    <div className="ml-auto flex items-center gap-1.5">
                      {(faqQuery || selectedCategory !== 'all') && (
                        <Button size="sm" variant="ghost" className="text-xs" onClick={() => { setFaqQuery(''); setSelectedCategory('all') }}>
                          {language === 'ur' ? 'صاف کریں' : 'Clear'}
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="text-xs" onClick={() => setExpandAll(v => !v)}>
                        {expandAll ? (language === 'ur' ? 'سب بند کریں' : 'Collapse all') : (language === 'ur' ? 'سب کھولیں' : 'Expand all')}
                      </Button>
                    </div>
                  </div>
                </div>

                {isNarrow && faqSelected ? (
                  <div className="space-y-2">
                    <Button size="sm" variant="ghost" onClick={() => setFaqSelected(null)} className="px-2">
                      ← {language === 'ur' ? 'واپس' : 'Back'}
                    </Button>
                    {(() => {
                      const sel = quickQuestions.find(q => q.id === faqSelected)
                      if (!sel) return null
                      const title = language === 'ur' && sel.labelUr ? sel.labelUr : sel.label
                      const answer = language === 'ur' && sel.answerUr ? sel.answerUr : sel.answer
                      return (
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 shadow-sm">
                          <div className="flex items-start justify-between gap-2">
                            <div className="font-semibold text-sm md:text-base text-[rgb(66,139,124)] flex items-center gap-2">
                              <HelpCircle className="h-4 w-4" />{title}
                              <Badge variant="secondary" className="ml-1 text-[10px] py-0.5 px-1.5 bg-[rgb(66,139,124)]/10 text-[rgb(66,139,124)] border-[rgb(66,139,124)]/20">
                                {categoryLabel(sel.category)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 flex-wrap justify-end">
                              <Button size="sm" variant="outline" onClick={() => navigator.clipboard?.writeText(getSummary(sel))} className="h-7 px-2" title="Copy summary">
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => copyDetailed(sel)} className="h-7 px-2" title="Copy all details">
                                <ClipboardList className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          {renderAnswerView(sel)}
                        </div>
                      )
                    })()}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{language === 'ur' ? 'سوالات' : 'Questions'}</div>
                      <div className="max-h-[56vh] md:max-h-[60vh] overflow-y-auto pr-1 space-y-1">
                        {(() => {
                          const query = faqQuery.trim().toLowerCase()
                          const filtered = quickQuestions.filter(q => (
                            (selectedCategory === 'all' || q.category === selectedCategory) && (
                              !query || q.label.toLowerCase().includes(query) || (q.labelUr?.toLowerCase().includes(query) ?? false)
                            )
                          ))
                          if (!filtered.length) {
                            return <div className="text-sm text-gray-500 p-3">{language === 'ur' ? 'کوئی سوال نہیں ملا' : 'No questions found'}</div>
                          }
                          return filtered.map((q) => {
                            const title = language === 'ur' && q.labelUr ? q.labelUr : q.label
                            const active = faqSelected === q.id
                            return (
                              <button
                                key={q.id}
                                onClick={() => setFaqSelected(q.id)}
                                className={`w-full text-left px-2.5 py-3 rounded-lg border transition-all active:scale-95 flex items-start gap-2 touch-highlight ${active ? 'border-[rgb(66,139,124)] bg-[rgb(66,139,124)]/10 shadow-sm' : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60 active:bg-gray-100 dark:active:bg-gray-700'}`}
                              >
                                <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[rgb(66,139,124)] mt-0.5 flex-shrink-0" />
                                <span className="text-[12px] sm:text-[13px] md:text-sm break-words line-clamp-2">{highlight(title, faqQuery)}</span>
                              </button>
                            )
                          })
                        })()}
                      </div>
                    </div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3">
                      {(() => {
                        const sel = quickQuestions.find(q => q.id === faqSelected)
                        if (!sel) {
                          return <div className="h-full min-h-[160px] grid place-items-center text-sm text-gray-500">
                            {language === 'ur' ? 'براہ کرم بائیں طرف سے سوال منتخب کریں' : 'Select a question from the left to see the answer'}
                          </div>
                        }
                        const title = language === 'ur' && sel.labelUr ? sel.labelUr : sel.label
                        const answer = language === 'ur' && sel.answerUr ? sel.answerUr : sel.answer
                        return (
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div className="font-semibold text-sm md:text-base text-[rgb(66,139,124)] flex items-center gap-2">
                                <HelpCircle className="h-4 w-4" />{title}
                                <Badge variant="secondary" className="ml-1 text-[10px] py-0.5 px-1.5 bg-[rgb(66,139,124)]/10 text-[rgb(66,139,124)] border-[rgb(66,139,124)]/20">
                                  {categoryLabel(sel.category)}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Button size="sm" variant="outline" onClick={() => navigator.clipboard?.writeText(getSummary(sel))} className="h-7 px-2" title="Copy summary">
                                  <Copy className="h-3.5 w-3.5" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => copyDetailed(sel)} className="h-7 px-2" title="Copy all details">
                                  <ClipboardList className="h-3.5 w-3.5" />
                                </Button>
                                <Button size="sm" variant="default" onClick={() => sendFaqToChat(sel)} className="h-7 px-2" title="Send to chat">
                                  <Send className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                            {renderAnswerView(sel)}
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-2 md:p-3 pb-1 space-y-2 md:space-y-3">

                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-2 md:gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 motion-reduce:transition-none motion-reduce:animate-none`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {message.sender === "bot" && (
                      <Avatar className="w-7 h-7 md:w-8 md:h-8 flex-shrink-0 ring-2 ring-[rgb(66,139,124)]/20 order-1">
                        <AvatarImage src="/images/gonstead-logo-new.png" className="object-contain p-1" />
                        <AvatarFallback className="bg-[rgb(66,139,124)]/10">
                          <Bot className="h-3 w-3 md:h-4 md:w-4 text-[rgb(66,139,124)]" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[75%] md:max-w-[80%] p-2.5 md:p-3 rounded-2xl transition-all duration-200 border ${message.sender === "user"
                        ? "bg-[rgb(66,139,124)] text-white border-[rgb(66,139,124)] rounded-br-md ml-auto order-2"
                        : "bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 rounded-bl-md mr-auto order-2"
                        }`}
                    >
                      <p className="text-[11px] md:text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`${message.sender === "user" ? "text-white/70" : "text-gray-500 dark:text-gray-400"
                          }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                    {message.sender === "user" && (
                      <Avatar className="w-7 h-7 md:w-8 md:h-8 flex-shrink-0 ring-2 ring-blue-500/20 order-3">
                        <AvatarFallback className="bg-blue-500/10">
                          <User className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-2 md:gap-3 justify-start animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                    <Avatar className="w-7 h-7 md:w-8 md:h-8 ring-2 ring-[rgb(66,139,124)]/20">
                      <AvatarImage src="/images/gonstead-logo-new.png" className="object-contain p-1" />
                      <AvatarFallback className="bg-[rgb(66,139,124)]/10">
                        <Bot className="h-3 w-3 md:h-4 md:w-4 text-[rgb(66,139,124)]" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white/95 dark:bg-gray-800/95 p-2.5 md:p-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-200 dark:border-gray-700">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-[rgb(66,139,124)] rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-[rgb(66,139,124)] rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-[rgb(66,139,124)] rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </CardContent>

          {/* Enhanced Input Area - Fixed positioning */}
          {!showQuick && (
            <div className="flex-shrink-0 p-2 md:p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="flex gap-2">
                <Input
                  aria-label="Message input"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 pl-3 py-2 md:py-2.5 rounded-lg border-gray-200/70 dark:border-gray-700 focus:border-[rgb(66,139,124)] focus:ring-[rgb(66,139,124)]/25 bg-white dark:bg-gray-800 text-sm w-full min-w-0 transition-all duration-200 shadow-sm"
                />
                <Button
                  aria-label="Send message"
                  onClick={sendMessage}
                  className="flex-shrink-0 bg-gradient-to-r from-[rgb(66,139,124)] to-[rgb(58,133,118)] hover:from-[rgb(72,145,130)] hover:to-[rgb(64,139,124)] text-white px-3 md:px-4 py-2.5 md:py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!inputMessage.trim()}
                  title="Send message"
                >
                  <Send className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      </Card>
    </div>
  )
}
