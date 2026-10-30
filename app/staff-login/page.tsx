'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LogIn, Shield, Stethoscope, AlertCircle, Loader2, Clock3 } from 'lucide-react'
import DeviceSecurityService from '@/lib/device-security'

export default function StaffLoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isChecking, setIsChecking] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const deviceSecurity = new DeviceSecurityService()

  // Update current time every second for live clock display
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = () => {
      const staffAuth = localStorage.getItem('staff_authenticated')
      if (staffAuth === 'true') {
        router.push('/staff-dashboard')
        return
      }
      setIsChecking(false)
    }
    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic client-side validation & offline check for a more professional experience
    if (!identifier.trim() || !password.trim()) {
      setError('Please enter username/email and password')
      return
    }

    if (typeof window !== 'undefined' && !navigator.onLine) {
      setError('No internet connection. Please check your network and try again.')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/staff/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: identifier.trim(),
          password,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result?.data) {
        throw new Error(result?.error || 'Invalid username/email or password')
      }

      const staff = result.data as {
        id: string
        username: string
        display_name?: string | null
      }

      if (staff) {
        // Create security event for successful login
        try {
          const securityEvent = await deviceSecurity.createSecurityEvent(
            staff.id,
            'login'
          )
          
          // Create device session
          const deviceInfo = await deviceSecurity.getDeviceInfo()
          const locationData = await deviceSecurity.getLocationData()
          
          await fetch('/api/device-sessions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              staff_id: staff.id,
              session_id: securityEvent.session_id,
              device_fingerprint: deviceInfo.device_fingerprint,
              device_info: deviceInfo,
              location_data: locationData
            })
          })
        } catch (securityError) {
          console.warn('Failed to create security event:', securityError)
          // Don't block login if security tracking fails
        }

        // Store authentication state for the staff portal
        localStorage.setItem('staff_authenticated', 'true')
        localStorage.setItem('staff_username', staff.username)
        if (staff.display_name) {
          localStorage.setItem('staff_display_name', staff.display_name)
        }
        localStorage.setItem('staff_user_id', staff.id)

        // Redirect to staff dashboard
        router.push('/staff-dashboard')
      } else {
        throw new Error('Sign in failed. Please try again.')
      }
    } catch (error: any) {
      console.error('Staff login error:', error)
      const message =
        typeof error?.message === 'string' && error.message.trim().length > 0
          ? error.message
          : 'Failed to sign in. Please check your credentials and try again.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50 to-slate-100 flex items-center justify-center px-4">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl shadow-md px-6 py-5 border border-emerald-50">
          <Loader2 className="h-6 w-6 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-700 text-sm font-medium">Preparing your staff portal…</p>
          <p className="text-gray-500 text-xs mt-1">Checking existing secure session</p>
        </div>
      </div>
    )
  }

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })

  const formatDay = (date: Date) =>
    date.toLocaleDateString('en-US', {
      weekday: 'long',
    })

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

  const isSubmitDisabled = isLoading || !identifier.trim() || !password.trim()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50 to-slate-100 flex items-center justify-center py-6 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-emerald-50 overflow-hidden">
          {/* Professional Header */}
          <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-6 py-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center border border-white/30">
                <Stethoscope className="h-5 w-5 text-emerald-50" />
              </div>
              <div className="text-center">
                <h1 className="text-xl font-semibold text-white tracking-tight">Staff Portal</h1>
                <p className="text-[11px] text-emerald-100 uppercase tracking-[0.16em]">Gonstead Chiropractic Clinic</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Live Date / Time / Day */}
            <div className="rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50/80 to-slate-50/80 px-3 py-2.5 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
                  <Clock3 className="h-4 w-4" />
                </div>
                <div className="leading-tight">
                  <p className="font-medium text-slate-900">Clinic date &amp; time</p>
                  <p className="text-[11px] text-slate-500 hidden sm:block">Live reference for timestamped staff activity</p>
                </div>
              </div>
              <div className="flex items-end justify-between sm:justify-end gap-4 sm:gap-6 text-right">
                <div className="leading-tight">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Day</p>
                  <p className="font-semibold text-slate-900">{formatDay(currentTime)}</p>
                </div>
                <div className="leading-tight hidden xs:block">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Date</p>
                  <p className="font-semibold text-slate-900">{formatDate(currentTime)}</p>
                </div>
                <div className="leading-tight">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Time</p>
                  <p className="font-semibold text-slate-900 tabular-nums">{formatTime(currentTime)}</p>
                </div>
              </div>
            </div>

            {/* Intro Text */}
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-gray-800">Secure Staff Sign In</p>
              <p className="text-xs text-gray-500">
                Use your registered staff username or email and password to access the internal dashboard.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4" aria-busy={isLoading}>
              {/* Username or Email Field */}
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Staff Username or Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="email"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-colors"
                  placeholder="username or name@clinic-domain.com"
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <span className="text-[11px] text-gray-400">Do not share your password</span>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-colors"
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div
                  className="flex items-start space-x-2 text-red-700 bg-red-50 px-3 py-2 rounded-md border border-red-200"
                  role="alert"
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span className="text-xs leading-relaxed">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="w-full bg-gradient-to-r from-emerald-700 to-emerald-500 text-white py-2.5 px-4 rounded-md font-medium text-sm shadow-sm hover:from-emerald-800 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing you in…</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            {/* Security Note */}
            <div className="mt-2 flex items-start space-x-2 rounded-md bg-emerald-50 px-3 py-2 border border-emerald-100">
              <Shield className="h-4 w-4 text-emerald-700 mt-0.5" />
              <p className="text-[11px] text-emerald-900 leading-relaxed">
                This portal is for authorized staff only. All access is monitored and logged for patient data safety.
              </p>
            </div>

            {/* Compact Footer */}
            <div className="pt-2 border-t border-gray-100 mt-2 text-center text-[11px] text-gray-500">
              <p>Having trouble signing in? Contact the clinic administrator.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
