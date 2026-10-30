import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of known scraping tools and bots
const BLOCKED_USER_AGENTS = [
  'httrack',
  'wget',
  'webzip',
  'web2zip',
  'teleport',
  'webcopier',
  'websucker',
  'sitesucker',
  'offline explorer',
  'website ripper',
  'website downloader',
  'sitesnagger',
  'webripper',
  'webdup',
  'msiecrawler',
  'surfbot',
  'webbandit',
  'webwhacker',
  'extractor',
  'copier',
  'scraper',
  'spider',
  'crawler',
  'harvester',
  'mirror',
  'python-requests',
  'python-urllib',
  'scrapy',
  'beautifulsoup',
  'selenium',
  'phantomjs',
  'headless',
  'automation',
  'bot',
  'curl',
  'postman'
]

// Suspicious request patterns
const SUSPICIOUS_PATTERNS = [
  /robots\.txt/i,
  /sitemap/i,
  /wp-admin/i,
  /\.zip$/i,
  /\.rar$/i,
  /download/i,
  /backup/i
]

// Rate limiting storage (in production, use Redis or database)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>()

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || ''
  const referer = request.headers.get('referer') || ''
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const url = request.nextUrl.pathname.toLowerCase()
  
  // Allow admin and staff routes to bypass anti-scraping checks
  if (url.startsWith('/admin') || url.startsWith('/staff-dashboard')) {
    return NextResponse.next()
  }
  
  // Skip middleware for static assets and API routes
  if (url.startsWith('/api/') || 
      url.startsWith('/images/') || 
      url.startsWith('/fonts/') || 
      url.startsWith('/css/') || 
      url.startsWith('/js/') ||
      url.includes('.png') ||
      url.includes('.jpg') ||
      url.includes('.jpeg') ||
      url.includes('.webp') ||
      url.includes('.ico') ||
      url.includes('.svg')) {
    return NextResponse.next()
  }
  
  // 1. Block known scraping tools
  const isBlockedUserAgent = BLOCKED_USER_AGENTS.some(agent => 
    userAgent.includes(agent.toLowerCase())
  )
  
  if (isBlockedUserAgent) {
    console.log(`Blocked scraping tool: ${userAgent} from IP: ${ip}`)
    return new NextResponse('Access Denied', { status: 403 })
  }
  
  // 2. Block suspicious URLs
  const isSuspiciousUrl = SUSPICIOUS_PATTERNS.some(pattern => 
    pattern.test(url)
  )
  
  if (isSuspiciousUrl) {
    console.log(`Blocked suspicious URL: ${url} from IP: ${ip}`)
    return new NextResponse('Not Found', { status: 404 })
  }
  
  // 3. Rate limiting per IP
  const now = Date.now()
  const windowMs = 60000 // 1 minute
  const maxRequests = 30 // Max 30 requests per minute per IP
  
  const rateLimitKey = `rate_limit_${ip}`
  const existing = rateLimitMap.get(rateLimitKey)
  
  if (existing) {
    if (now - existing.timestamp < windowMs) {
      existing.count++
      if (existing.count > maxRequests) {
        console.log(`Rate limit exceeded for IP: ${ip}`)
        return new NextResponse('Too Many Requests', { status: 429 })
      }
    } else {
      // Reset window
      rateLimitMap.set(rateLimitKey, { count: 1, timestamp: now })
    }
  } else {
    rateLimitMap.set(rateLimitKey, { count: 1, timestamp: now })
  }
  
  // 4. Block requests without referer (suspicious for automated tools)
  // BUT allow direct access from mobile browsers, bookmarks, etc.
  if (!referer && !userAgent.includes('google') && !userAgent.includes('bing')) {
    const isDirectAccess = url === '/' || url === '/index'
    const isAssetRequest = url.startsWith('/images/') || 
                          url.startsWith('/fonts/') || 
                          url.startsWith('/css/') || 
                          url.startsWith('/js/') ||
                          url.includes('.png') ||
                          url.includes('.jpg') ||
                          url.includes('.jpeg') ||
                          url.includes('.webp') ||
                          url.includes('.ico') ||
                          url.includes('.svg')
    
    // Allow legitimate mobile browsers (common user agents)
    const isMobileBrowser = userAgent.includes('mobile') || 
                           userAgent.includes('android') || 
                           userAgent.includes('iphone') || 
                           userAgent.includes('ipad') || 
                           userAgent.includes('safari')
    
    if (!isDirectAccess && !isAssetRequest && !isMobileBrowser) {
      console.log(`Blocked request without referer: ${url} from IP: ${ip}`)
      return new NextResponse('Forbidden', { status: 403 })
    }
  }
  
  // 5. Previously blocked rapid sequential requests (<100ms) which interfered with normal navigation.
  //    Relax this rule to avoid false positives during page refreshes and client-side routing.
  const sequentialKey = `sequential_${ip}`
  rateLimitMap.set(sequentialKey, { count: 1, timestamp: now })
  
  // Add security headers
  const response = NextResponse.next()
  
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-Anti-Scraping', 'protected')
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all paths except static assets and API routes
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
