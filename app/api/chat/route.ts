import { NextRequest, NextResponse } from 'next/server'
import { answerFromSiteKnowledge } from '@/lib/site-knowledge'

// Enhanced rate limiting with abuse detection
const RATE_LIMIT_WINDOW_MS = 60_000 // 1 minute
const RATE_LIMIT_MAX = 10 // Reduced from 20 to 10 requests per minute
const RATE_LIMIT_DAILY_MAX = 100 // Max 100 requests per day per IP
const rateMap = new Map<string, { count: number; resetAt: number; dailyCount: number; dailyResetAt: number }>()

function checkRate(ip: string): { allowed: boolean; reason?: string } {
  const now = Date.now()
  const entry = rateMap.get(ip)
  
  // Initialize or reset
  if (!entry || now > entry.resetAt) {
    const dailyCount = entry && now < entry.dailyResetAt ? entry.dailyCount + 1 : 1
    const dailyResetAt = entry && now < entry.dailyResetAt ? entry.dailyResetAt : now + 86400000 // 24 hours
    
    // Check daily limit
    if (dailyCount > RATE_LIMIT_DAILY_MAX) {
      return { allowed: false, reason: 'Daily limit exceeded' }
    }
    
    rateMap.set(ip, { 
      count: 1, 
      resetAt: now + RATE_LIMIT_WINDOW_MS,
      dailyCount,
      dailyResetAt
    })
    return { allowed: true }
  }
  
  // Check minute limit
  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, reason: 'Rate limit exceeded' }
  }
  
  // Check daily limit
  if (entry.dailyCount >= RATE_LIMIT_DAILY_MAX) {
    return { allowed: false, reason: 'Daily limit exceeded' }
  }
  
  entry.count += 1
  entry.dailyCount += 1
  return { allowed: true }
}

function sanitize(input: string): string {
  const trimmed = input.slice(0, 500) // Reduced from 1200 to 500
  // Strip HTML, scripts, control chars, and malicious patterns
  return trimmed
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

// Detect simple greetings / small talk that should get a friendly clinic reply
function isGreeting(message: string): boolean {
  const m = message.toLowerCase().trim().replace(/[!?.\s]+$/, '')
  const standaloneGreetings = new Set([
    'hi', 'hello', 'hey', 'salam', 'assalam', 'as salam', 'as-salam', 
    'salaam', 'good morning', 'good afternoon', 'good evening', 
    'how are you', 'how r u', 'how are u', 'kese ho', 'kesi ho', 'kia haal', 'kya haal'
  ])
  return standaloneGreetings.has(m)
}

// Detect booking / appointment intent for simple, deterministic replies
function isBookingIntent(message: string): boolean {
  const m = message.toLowerCase().trim()
  if (!m) return false
  if (/(book|booking|appointment|schedule|reserve|slot|visit|meet)/.test(m)) return true
  if (/(tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/.test(m) &&
      /(come|visit|see you|appointment)/.test(m)) return true
  return false
}

// Detect prompt injection attempts
function detectPromptInjection(message: string): boolean {
  const suspiciousPatterns = [
    /ignore\s+(previous|all|above)\s+instructions?/i,
    /forget\s+(everything|all|previous)/i,
    /you\s+are\s+now/i,
    /new\s+instructions?/i,
    /system\s*:\s*/i,
    /\[INST\]/i,
    /<\|im_start\|>/i,
    /##\s*Instructions/i,
    /disregard/i,
    /override/i
  ]
  return suspiciousPatterns.some(pattern => pattern.test(message))
}

function buildClinicContext() {
  // Simple static context derived from the public main page only.
  return [
    'Clinic: Gonstead Chiropractic Clinic',
    'Doctor: Bashir Khan Chiropractic (Gonstead specialist, 15+ years experience as stated on the site)',
    'Location: Near Peshawar Model School, Tehsil Road, Nowshera, Khyber Pakhtunkhwa',
    'Phone: +92 304 699 6267',
    'Hours: Monday–Saturday 9:00 AM–6:00 PM; Sunday emergency only',
  ].join('\n')
}

// External AI calls (xAI, Gemini, OpenRouter) are currently disabled.
// This route acts as a medically-aware assistant powered by the local
// knowledge base plus strict safety rules and clinic-specific context.

export async function POST(req: NextRequest) {
  try {
    // Get real IP address
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               req.headers.get('x-real-ip') || 
               req.ip || 
               'unknown'
    
    // Check rate limit
    const rateCheck = checkRate(ip)
    if (!rateCheck.allowed) {
      return NextResponse.json({ 
        error: rateCheck.reason === 'Daily limit exceeded' 
          ? 'Daily request limit reached. Please try again tomorrow.' 
          : 'Too many requests. Please wait a moment and try again.',
        code: rateCheck.reason === 'Daily limit exceeded' ? 'DAILY_LIMIT' : 'RATE_LIMIT'
      }, { status: 429 })
    }

    const body = await req.json()
    const rawMessage = typeof body?.message === 'string' ? body.message : ''
    if (!rawMessage) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 })
    }

    const message = sanitize(rawMessage)
    
    // Friendly greeting handling (small talk that does NOT require knowledge lookup)
    if (isGreeting(message)) {
      const greetingText = `Wa Alaikum Assalam, and welcome to Gonstead Chiropractic Clinic. I am your clinical support assistant for Bashir Khan Chiropractic. How can I help you today with your back, neck, spinal concerns, or booking an appointment?`
      return NextResponse.json({ text: greetingText }, { headers: {
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store'
      } })
    }

    // Appointment / meeting intent handling
    if (isBookingIntent(message)) {
      const bookingText = [
        'To book an appointment with Bashir Khan Chiropractic at Gonstead Chiropractic Clinic, you can:',
        '\n\n- Use the "Book Now" or "Schedule Your Consultation" button on this website.',
        '\n- Call the clinic at +92 304 699 6267.',
        '\n- Or email gonsteadchiropractic.org@gmail.com to request a time.',
        '\n\nClinic hours on the site are Monday–Saturday 9:00 AM–6:00 PM, with Sundays reserved for emergency cases.',
        '\n\nImportant: This chat cannot confirm exact time slots. For urgent or emergency symptoms, please call the clinic directly or seek emergency care (1122).',
      ].join('')

      return NextResponse.json({ text: bookingText }, { headers: {
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store'
      } })
    }
    
    // Detect prompt injection / jailbreak attempts
    if (detectPromptInjection(rawMessage)) {
      console.warn('Prompt injection attempt detected from IP:', ip)
      return NextResponse.json({ 
        error: 'Invalid request. Please ask a genuine question about chiropractic care.',
        code: 'INVALID_INPUT'
      }, { status: 400 })
    }
    
    const history = Array.isArray(body?.history) ? body.history.slice(-4) : [] // Limit history to last 4 messages
    const extraContextRaw = typeof body?.medicalContext === 'string' ? body.medicalContext : ''
    const extraContext = extraContextRaw ? sanitize(extraContextRaw).slice(0, 1000) : ''

    const clinicContext = buildClinicContext()
    const systemPrompt = `You are a helpful, versatile, and highly intelligent AI assistant representing Dr. Bashir Khan's Gonstead Chiropractic Clinic in Nowshera, Pakistan.

Your Core Capabilities:
1. Answer ANY question asked by the user intelligently, clearly, and concisely (whether about general knowledge, Pakistan geography, science, history, daily life, technology, or health).
2. For clinic, chiropractic, or spinal health questions: Provide expert, accurate explanations of Gonstead methods, symptoms (back/neck pain, sciatica, headaches), and clinic booking.
3. Tone: Warm, respectful, helpful, and natural.`;

    const lastMessages = history.slice(-6).map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: sanitize(String(m.text || ''))
    }))

    // 1. Groq High-Speed AI Integration
    const groqKey = process.env.GROQ_API_KEY
    const groqModels = [
      process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
      'openai/gpt-oss-120b',
      'allam-2-7b'
    ]

    if (groqKey) {
      const groqPayloadMessages = [
        { role: 'system', content: systemPrompt },
        ...lastMessages,
        { role: 'user', content: message }
      ]

      for (const model of groqModels) {
        try {
          const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + groqKey
            },
            body: JSON.stringify({
              model,
              messages: groqPayloadMessages,
              temperature: 0.6,
              max_tokens: 500
            }),
            signal: AbortSignal.timeout(10000)
          })

          if (groqRes.ok) {
            const data = await groqRes.json()
            const generatedText = data?.choices?.[0]?.message?.content
            if (generatedText) {
              return NextResponse.json({ text: generatedText }, { headers: {
                'X-Content-Type-Options': 'nosniff',
                'Cache-Control': 'no-store'
              } })
            }
          } else {
            console.warn('Groq model ' + model + ' returned status:', groqRes.status)
          }
        } catch (callErr) {
          console.warn('Groq call error on ' + model + ':', callErr)
        }
      }
    }

    const siteAnswer = answerFromSiteKnowledge(message)

    if (!siteAnswer) {
      const safeText = 'I am here to assist with Gonstead Chiropractic Clinic in Nowshera. For your specific health situation, please contact the clinic directly at +92 304 699 6267 or visit us in person. For any urgent emergencies, please call 1122.'
      return NextResponse.json({ text: safeText }, { headers: {
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store'
      } })
    }

    return NextResponse.json({ text: siteAnswer.text }, { headers: {
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store'
    } })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: {
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store'
    } })
  }
}
