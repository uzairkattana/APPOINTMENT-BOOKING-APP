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
  LineChart,
  ExternalLink,
  BookOpen
} from "lucide-react"
import Link from "next/link"
import { quickQuestions, QuickCategory, DetailSection, QQ } from "@/lib/faq-data"
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

  // FAQ data and types imported from @/lib/faq-data

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
                {/* Link to dedicated FAQ page */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#0d5c75]/10 dark:bg-cyan-950/40 border border-[#0d5c75]/20 text-xs">
                  <div className="flex items-center gap-1.5 text-[#0d5c75] dark:text-cyan-300 font-medium">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>{language === 'ur' ? 'مکمل تفصیلی FAQ صفحہ' : 'Full Dedicated FAQ Page'}</span>
                  </div>
                  <Link
                    href="/faq"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#0d5c75] hover:bg-[#0a4a5c] text-white font-semibold transition-colors"
                  >
                    <span>{language === 'ur' ? 'کھولیں' : 'Open Page'}</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
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
