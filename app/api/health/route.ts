import { NextRequest, NextResponse } from 'next/server'
import { getPatientsFirestore } from '@/lib/firebase-db'

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  uptime: number
  version: string
  checks: {
    database: 'connected' | 'disconnected' | 'error'
    memory: 'ok' | 'high' | 'critical'
    environment: 'ok' | 'missing_vars'
  }
  details?: {
    databaseLatency?: number
    memoryUsage?: {
      used: number
      total: number
      percentage: number
    }
  }
}

const serverStartTime = Date.now()

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const health: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - serverStartTime) / 1000),
      version: process.env.npm_package_version || '3.0.0',
      checks: {
        database: 'disconnected',
        memory: 'ok',
        environment: 'ok',
      },
      details: {},
    }

    // Check 1: Database Connection (Firestore)
    try {
      await getPatientsFirestore()
      const dbLatency = Date.now() - startTime
      health.checks.database = 'connected'
      health.details!.databaseLatency = dbLatency
    } catch (dbError) {
      health.checks.database = 'error'
      health.status = 'unhealthy'
    }

    // Check 2: Memory Usage
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage()
      const totalMemory = memUsage.heapTotal
      const usedMemory = memUsage.heapUsed
      const percentage = (usedMemory / totalMemory) * 100

      health.details!.memoryUsage = {
        used: Math.round(usedMemory / 1024 / 1024),
        total: Math.round(totalMemory / 1024 / 1024),
        percentage: Math.round(percentage),
      }

      if (percentage > 90) {
        health.checks.memory = 'critical'
        health.status = 'unhealthy'
      } else if (percentage > 75) {
        health.checks.memory = 'high'
        health.status = 'degraded'
      }
    }

    // Check 3: Firebase Environment Variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    ]

    const missingVars = requiredEnvVars.filter(
      varName => !process.env[varName]
    )

    if (missingVars.length > 0) {
      health.checks.environment = 'missing_vars'
      health.status = 'unhealthy'
    }

    const statusCode = health.status === 'healthy' ? 200 : 
                       health.status === 'degraded' ? 200 : 503

    return NextResponse.json(health, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })

  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal error',
      },
      { 
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      }
    )
  }
}

export async function HEAD(request: NextRequest) {
  return new NextResponse(null, { status: 200 })
}
