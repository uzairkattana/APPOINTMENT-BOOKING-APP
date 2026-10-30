"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, TrendingUp, Clock, Users, Activity } from "lucide-react"
import type { AuditLog } from "@/lib/data-service"

interface AuditAnalyticsProps {
  logs: AuditLog[]
}

export function AuditAnalytics({ logs }: AuditAnalyticsProps) {
  const analytics = useMemo(() => {
    const now = new Date()
    const getTimestamp = (l: AuditLog) => l.timestamp || new Date().toISOString()
    const last24h = logs.filter(l => new Date(getTimestamp(l)) > new Date(now.getTime() - 24*60*60*1000))
    const last7d = logs.filter(l => new Date(getTimestamp(l)) > new Date(now.getTime() - 7*24*60*60*1000))
    
    // Activity heatmap (by hour)
    const hourlyActivity = Array(24).fill(0)
    last7d.forEach(log => {
      const hour = new Date(getTimestamp(log)).getHours()
      hourlyActivity[hour]++
    })
    const peakHour = hourlyActivity.indexOf(Math.max(...hourlyActivity))
    
    // User activity
    const userActivity = new Map<string, number>()
    last24h.forEach(log => {
      const email = log.actor_email || 'unknown'
      userActivity.set(email, (userActivity.get(email) || 0) + 1)
    })
    const mostActiveUser = Array.from(userActivity.entries()).sort((a, b) => b[1] - a[1])[0]
    
    // Suspicious patterns detection
    const suspiciousPatterns: Array<{type: string, severity: 'high' | 'medium' | 'low', description: string}> = []
    
    // 1. Multiple deletions in short time
    const recentDeletes = last24h.filter(l => l.action === 'delete' && l.entity_type === 'patient')
    if (recentDeletes.length >= 5) {
      suspiciousPatterns.push({
        type: 'Mass Deletion',
        severity: 'high',
        description: `${recentDeletes.length} patients deleted in last 24h`
      })
    }
    
    // 2. Failed login attempts (if tracked)
    const failedLogins = last24h.filter(l => l.action === 'error' && l.entity_type === 'auth')
    if (failedLogins.length >= 3) {
      suspiciousPatterns.push({
        type: 'Failed Logins',
        severity: 'medium',
        description: `${failedLogins.length} failed login attempts`
      })
    }
    
    // 3. After-hours activity (10 PM - 6 AM)
    const afterHoursActivity = last7d.filter(l => {
      const hour = new Date(getTimestamp(l)).getHours()
      return hour >= 22 || hour < 6
    })
    if (afterHoursActivity.length > 10) {
      suspiciousPatterns.push({
        type: 'After-Hours Activity',
        severity: 'low',
        description: `${afterHoursActivity.length} actions after hours in last 7 days`
      })
    }
    
    // 4. High-frequency updates on same entity
    const entityUpdateCounts = new Map<string, number>()
    last24h.filter(l => l.action === 'update').forEach(log => {
      if (log.entity_id) {
        entityUpdateCounts.set(log.entity_id, (entityUpdateCounts.get(log.entity_id) || 0) + 1)
      }
    })
    const highFreqUpdates = Array.from(entityUpdateCounts.entries()).filter(([_, count]) => count >= 5)
    if (highFreqUpdates.length > 0) {
      suspiciousPatterns.push({
        type: 'Rapid Updates',
        severity: 'medium',
        description: `${highFreqUpdates.length} entities updated 5+ times in 24h`
      })
    }
    
    // Trends
    const compareWithPrevious = (current: AuditLog[], days: number) => {
      const prevStart = new Date(now.getTime() - 2*days*24*60*60*1000)
      const prevEnd = new Date(now.getTime() - days*24*60*60*1000)
      const previous = logs.filter(l => {
        const t = new Date(getTimestamp(l))
        return t >= prevStart && t < prevEnd
      })
      const change = current.length - previous.length
      const percentChange = previous.length > 0 ? (change / previous.length) * 100 : 0
      return { change, percentChange: Math.round(percentChange) }
    }
    
    const trend24h = compareWithPrevious(last24h, 1)
    const trend7d = compareWithPrevious(last7d, 7)
    
    return {
      hourlyActivity,
      peakHour,
      mostActiveUser,
      suspiciousPatterns,
      trends: { trend24h, trend7d },
      stats: {
        total24h: last24h.length,
        total7d: last7d.length,
        uniqueUsers24h: userActivity.size,
        avgPerHour: Math.round(last24h.length / 24)
      }
    }
  }, [logs])
  
  return (
    <div className="space-y-6">
      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500">Last 24h</div>
                <div className="text-2xl font-bold">{analytics.stats.total24h}</div>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center text-xs">
              {analytics.trends.trend24h.percentChange > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-green-600">+{analytics.trends.trend24h.percentChange}%</span>
                </>
              ) : (
                <span className="text-gray-500">{analytics.trends.trend24h.percentChange}%</span>
              )}
              <span className="text-gray-500 ml-1">vs prev day</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500">Active Users</div>
                <div className="text-2xl font-bold">{analytics.stats.uniqueUsers24h}</div>
              </div>
              <Users className="h-8 w-8 text-emerald-500" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {analytics.mostActiveUser ? (
                <span>Most active: {analytics.mostActiveUser[0].split('@')[0]}</span>
              ) : (
                <span>No activity</span>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500">Peak Hour</div>
                <div className="text-2xl font-bold">{analytics.peakHour}:00</div>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {analytics.hourlyActivity[analytics.peakHour]} actions
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500">Avg/Hour</div>
                <div className="text-2xl font-bold">{analytics.stats.avgPerHour}</div>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Based on 24h data
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Hourly Activity Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity Heatmap (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-12 gap-1">
            {analytics.hourlyActivity.map((count, hour) => {
              const maxCount = Math.max(...analytics.hourlyActivity)
              const intensity = maxCount > 0 ? count / maxCount : 0
              const bgColor = intensity > 0.7 ? 'bg-emerald-600' : 
                             intensity > 0.4 ? 'bg-emerald-400' : 
                             intensity > 0.1 ? 'bg-emerald-200' : 'bg-gray-100'
              return (
                <div key={hour} className="text-center">
                  <div className={`h-12 ${bgColor} rounded transition-all hover:scale-110 flex items-center justify-center`}>
                    <span className="text-xs font-medium">{count > 0 ? count : ''}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{hour}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Suspicious Patterns Alert */}
      {analytics.suspiciousPatterns.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Suspicious Activity Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.suspiciousPatterns.map((pattern, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                  <Badge variant={pattern.severity === 'high' ? 'destructive' : 'default'} className={
                    pattern.severity === 'high' ? 'bg-red-600' :
                    pattern.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                  }>
                    {pattern.severity.toUpperCase()}
                  </Badge>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{pattern.type}</div>
                    <div className="text-xs text-gray-600">{pattern.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

