import { NextRequest, NextResponse } from 'next/server'
import { supabase } from './supabase'

/**
 * Authentication Helper for API Routes
 * 
 * Provides reusable authentication and authorization checks
 * for Next.js API routes (Route Handlers)
 */

export interface AuthUser {
  id: string
  email: string | undefined
  role?: string
  emailVerified: boolean
}

export interface AuthResult {
  authenticated: boolean
  user?: AuthUser
  error?: string
}

/**
 * Verify if request has valid authentication
 * 
 * Usage in API routes:
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const auth = await verifyAuth(request)
 *   if (!auth.authenticated) {
 *     return unauthorizedResponse(auth.error)
 *   }
 *   // ... protected logic
 * }
 * ```
 */
export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    // Get auth token from header or cookie
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return {
        authenticated: false,
        error: 'No authentication token provided'
      }
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return {
        authenticated: false,
        error: error?.message || 'Invalid authentication token'
      }
    }

    return {
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role,
        emailVerified: !!user.email_confirmed_at,
      }
    }
  } catch (error: any) {
    return {
      authenticated: false,
      error: 'Authentication verification failed'
    }
  }
}

/**
 * Verify user has required role
 * 
 * Usage:
 * ```typescript
 * const auth = await verifyRole(request, ['admin', 'doctor'])
 * if (!auth.authenticated) {
 *   return forbiddenResponse('Insufficient permissions')
 * }
 * ```
 */
export async function verifyRole(
  request: NextRequest,
  allowedRoles: string[]
): Promise<AuthResult> {
  const auth = await verifyAuth(request)

  if (!auth.authenticated || !auth.user) {
    return auth
  }

  const userRole = auth.user.role || 'patient'
  
  if (!allowedRoles.includes(userRole)) {
    return {
      authenticated: false,
      error: `Insufficient permissions. Required role: ${allowedRoles.join(' or ')}`
    }
  }

  return auth
}

/**
 * Verify email is confirmed
 */
export async function verifyEmailConfirmed(request: NextRequest): Promise<AuthResult> {
  const auth = await verifyAuth(request)

  if (!auth.authenticated || !auth.user) {
    return auth
  }

  if (!auth.user.emailVerified) {
    return {
      authenticated: false,
      error: 'Email verification required'
    }
  }

  return auth
}

/**
 * Standard response helpers
 */

export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
  return NextResponse.json(
    {
      error: message,
      code: 'UNAUTHORIZED',
      timestamp: new Date().toISOString(),
    },
    { 
      status: 401,
      headers: {
        'WWW-Authenticate': 'Bearer',
      }
    }
  )
}

export function forbiddenResponse(message: string = 'Forbidden'): NextResponse {
  return NextResponse.json(
    {
      error: message,
      code: 'FORBIDDEN',
      timestamp: new Date().toISOString(),
    },
    { status: 403 }
  )
}

export function validationErrorResponse(errors: Record<string, string>): NextResponse {
  return NextResponse.json(
    {
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors,
      timestamp: new Date().toISOString(),
    },
    { status: 422 }
  )
}

export function serverErrorResponse(message: string = 'Internal server error'): NextResponse {
  return NextResponse.json(
    {
      error: process.env.NODE_ENV === 'development' ? message : 'An error occurred',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  )
}

export function successResponse<T>(data: T, message?: string): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  )
}

/**
 * Rate limiting helper (basic - use Redis for production)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string, // IP or user ID
  maxRequests: number = 60,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  if (!entry || now > entry.resetTime) {
    // New window or expired
    const resetTime = now + windowMs
    rateLimitStore.set(identifier, { count: 1, resetTime })
    return { allowed: true, remaining: maxRequests - 1, resetTime }
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime }
  }

  entry.count++
  return { allowed: true, remaining: maxRequests - entry.count, resetTime: entry.resetTime }
}

export function rateLimitResponse(resetTime: number): NextResponse {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000)
  
  return NextResponse.json(
    {
      error: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter,
      timestamp: new Date().toISOString(),
    },
    {
      status: 429,
      headers: {
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Reset': new Date(resetTime).toISOString(),
      }
    }
  )
}

/**
 * Extract client IP from request
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  
  return forwarded?.split(',')[0] || real || 'unknown'
}

/**
 * Example: Protected API route wrapper
 * 
 * Usage:
 * ```typescript
 * export const POST = withAuth(async (request, auth) => {
 *   // auth.user is guaranteed to exist here
 *   return successResponse({ userId: auth.user.id })
 * }, ['admin', 'doctor'])
 * ```
 */
export function withAuth(
  handler: (request: NextRequest, auth: AuthResult) => Promise<NextResponse>,
  requiredRoles?: string[]
) {
  return async (request: NextRequest) => {
    try {
      // Check rate limit
      const clientIP = getClientIP(request)
      const rateLimit = checkRateLimit(clientIP, 60, 60000)
      
      if (!rateLimit.allowed) {
        return rateLimitResponse(rateLimit.resetTime)
      }

      // Verify authentication
      const auth = requiredRoles 
        ? await verifyRole(request, requiredRoles)
        : await verifyAuth(request)

      if (!auth.authenticated) {
        return unauthorizedResponse(auth.error)
      }

      // Call the actual handler
      return await handler(request, auth)
    } catch (error: any) {
      console.error('API Error:', error)
      return serverErrorResponse(error.message)
    }
  }
}

