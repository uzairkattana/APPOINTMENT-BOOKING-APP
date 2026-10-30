'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calendar, 
  Clock, 
  User, 
  UserCheck, 
  Search, 
  Filter, 
  LogOut, 
  Phone, 
  Mail, 
  MapPin, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Clock3,
  Stethoscope,
  RefreshCw,
  Eye,
  Users,
  Shield,
  Lock,
  EyeOff
} from 'lucide-react'
import { getPatients, type Patient } from "@/lib/data-service"
import { useToast } from '@/hooks/use-toast'
import DeviceSecurityService from '@/lib/device-security'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import StaffWhatsAppChatInbox from '@/components/StaffWhatsAppChatInbox'
import StaffScrollToTopButton from '@/components/StaffScrollToTopButton'

// Lazy-load staff PWA install client only on client side
const StaffServiceWorkerClient = dynamic(() => import('@/components/StaffServiceWorkerClient'), { ssr: false })

const statusColors = {
  pending: 'bg-orange-100 text-orange-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800'
}

const statusIcons = {
  pending: Clock3,
  confirmed: CheckCircle,
  completed: CheckCircle,
  cancelled: XCircle
}

export default function StaffDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const deviceSecurity = new DeviceSecurityService()
  
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Dashboard states
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [staffUsername, setStaffUsername] = useState('')
  const [staffUserId, setStaffUserId] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState('')
  // Clinic operating-hours awareness for staff views
  const [todayHours, setTodayHours] = useState<{ open: string; close: string; closed: boolean } | null>(null)
  const [clinicStatus, setClinicStatus] = useState<'unknown' | 'open_now' | 'closed_now' | 'closed_day'>('unknown')
  // New high‑level date filters for staff: All / Today / Next 7 Days
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'next'>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null)

  // Update current time every second
  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Check authentication on page load and setup real-time sync
  useEffect(() => {
    const checkAuth = () => {
      const staffAuth = localStorage.getItem('staff_authenticated')
      const staffUser = localStorage.getItem('staff_username')
      const storedStaffUserId = localStorage.getItem('staff_user_id')
      
      if (staffAuth === 'true' && staffUser) {
        setIsAuthenticated(true)
        setStaffUsername(staffUser)
        if (storedStaffUserId) setStaffUserId(storedStaffUserId)
        loadPatientData()
        setupSessionTimeout()
      } else {
        setIsAuthenticated(false)
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  // Real-time data synchronization with admin dashboard
  useEffect(() => {
    if (!isAuthenticated) return

    // Listen for new appointments from the booking form and admin dashboard
    const handleNewAppointment = (event: CustomEvent) => {
      console.log('Staff Dashboard: Received new appointment event:', event.detail)
      const newPatient = event.detail as any
      
      // Only accept admin-managed bookings for staff view
      if (newPatient?.booking_source !== 'admin_dashboard') {
        console.log('Staff Dashboard: Ignoring non-admin booking in staff view')
        return
      }
      
      // Update patient list with new appointment
      setPatients(prev => {
        const existingPatient = prev.find(p => p.id === newPatient.id)
        if (existingPatient) {
          // Update existing patient
          return prev.map(p => p.id === newPatient.id ? newPatient : p)
        } else {
          // Add new patient
          return [newPatient, ...prev]
        }
      })
      
      toast({
        title: '📋 New Patient Update',
        description: `${newPatient.name} appointment data has been synchronized`,
      })
    }

    const handlePatientUpdate = (event: CustomEvent) => {
      console.log('Staff Dashboard: Received patient update event:', event.detail)
      const updatedPatient = event.detail
      
      setPatients(prev => 
        prev.map(p => p.id === updatedPatient.id ? updatedPatient : p)
      )
      
      toast({
        title: '🔄 Patient Updated',
        description: `${updatedPatient.name} information has been updated`,
      })
    }

    // Add event listeners for real-time updates
    window.addEventListener('newAppointment', handleNewAppointment as EventListener)
    window.addEventListener('patientUpdated', handlePatientUpdate as EventListener)
    
    // Setup periodic data refresh (every 2 minutes)
    const refreshInterval = setInterval(async () => {
      console.log('Staff Dashboard: Performing periodic data refresh...')
      await loadPatientData()
    }, 2 * 60 * 1000) // 2 minutes
    
    // Cleanup
    return () => {
      window.removeEventListener('newAppointment', handleNewAppointment as EventListener)
      window.removeEventListener('patientUpdated', handlePatientUpdate as EventListener)
      clearInterval(refreshInterval)
    }
  }, [isAuthenticated])

  // Helper functions for time/date display
  const formatTime12Hour = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDayOnly = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
    })
  }

  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCompactDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: '2-digit',
    })
  }

  // Determine today's operating hours from localStorage (with sensible defaults)
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const raw = localStorage.getItem('operating_hours')
      let hoursByDay: any = null
      if (raw) {
        hoursByDay = JSON.parse(raw)
      } else {
        // Fallback default hours if settings not configured yet
        hoursByDay = {
          monday: { open: '09:00', close: '18:00', closed: false },
          tuesday: { open: '09:00', close: '18:00', closed: false },
          wednesday: { open: '09:00', close: '18:00', closed: false },
          thursday: { open: '09:00', close: '18:00', closed: false },
          friday: { open: '09:00', close: '18:00', closed: false },
          saturday: { open: '09:00', close: '18:00', closed: false },
          sunday: { open: '00:00', close: '00:00', closed: true },
        }
      }

      const weekday = currentTime
        .toLocaleDateString('en-US', { weekday: 'long' })
        .toLowerCase() // e.g. 'monday'
      const dayHours = hoursByDay?.[weekday] || null
      if (dayHours && typeof dayHours.open === 'string' && typeof dayHours.close === 'string') {
        setTodayHours({
          open: dayHours.open,
          close: dayHours.close,
          closed: !!dayHours.closed,
        })
      } else {
        setTodayHours(null)
      }
    } catch (e) {
      console.warn('Failed to read operating_hours from localStorage:', e)
      setTodayHours(null)
    }
  }, [currentTime.toDateString()])

  // Recompute clinic open/closed status whenever time or hours change
  useEffect(() => {
    if (!todayHours) {
      setClinicStatus('unknown')
      return
    }

    if (todayHours.closed) {
      setClinicStatus('closed_day')
      return
    }

    const [openH, openM] = (todayHours.open || '09:00').split(':').map((n) => parseInt(n || '0', 10))
    const [closeH, closeM] = (todayHours.close || '18:00').split(':').map((n) => parseInt(n || '0', 10))

    const openTime = new Date(currentTime)
    openTime.setHours(openH, openM, 0, 0)

    const closeTime = new Date(currentTime)
    closeTime.setHours(closeH, closeM, 0, 0)

    if (currentTime >= openTime && currentTime <= closeTime) {
      setClinicStatus('open_now')
    } else {
      setClinicStatus('closed_now')
    }
  }, [currentTime, todayHours])

  // Setup session timeout (30 minutes)
  const setupSessionTimeout = () => {
    if (sessionTimeout) clearTimeout(sessionTimeout)
    
    const timeout = setTimeout(() => {
      handleStaffLogout()
      toast({
        title: '⏰ Session Expired',
        description: 'Your session has expired. Please log in again.',
        variant: 'destructive'
      })
    }, 30 * 60 * 1000) // 30 minutes
    
    setSessionTimeout(timeout)
  }

  // Load patient data with proper synchronization from admin dashboard
  const loadPatientData = async () => {
    try {
      console.log('Staff Dashboard: Loading patient data...')
      
      // Load from Supabase (real data)
      const { data: supabasePatients, error } = await getPatients()
      if (error) {
        console.error('Staff Dashboard: Error loading Supabase patients:', error)
      }
      const realPatients = supabasePatients || []
      console.log('Staff Dashboard: Loaded Supabase patients:', realPatients.length)
      
      // Include admin-managed patients from localStorage as a fallback (when DB is unavailable)
      const localStoragePatients: Patient[] = (() => {
        try {
          const raw = localStorage.getItem('gonstead_patients') || '[]'
          const parsed: any[] = JSON.parse(raw)
          return parsed.filter((p: any) => p.booking_source === 'admin_dashboard')
        } catch {
          return []
        }
      })()

      // Filter Supabase patients to admin-managed only (treat missing booking_source as admin-created)
      const adminDbPatients = (realPatients as any[]).filter((p: any) => !p.booking_source || p.booking_source === 'admin_dashboard')

      // Merge (prefer Supabase over localStorage on ID conflicts)
      const mergedMap = new Map<string, Patient>()
      adminDbPatients.forEach(p => mergedMap.set(p.id, p))
      localStoragePatients.forEach(p => { if (!mergedMap.has(p.id)) mergedMap.set(p.id, p) })
      const mergedPatients = Array.from(mergedMap.values())

      console.log('Staff Dashboard: Admin-managed patients (db+local):', mergedPatients.length)
      
      // Sort by appointment date (most recent first)
      const sortedPatients = mergedPatients.sort((a, b) => 
        new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
      )
      
      setPatients(sortedPatients)
      setFilteredPatients(sortedPatients)
      
    } catch (error) {
      console.error('Staff Dashboard: Error loading patient data:', error)
      setError('Failed to load patient data')
    }
  }

// Staff authentication using admin-managed staff_accounts
const handleStaffLogin = async (e: React.FormEvent) => {
  e.preventDefault()
  setAuthLoading(true)

  try {
    if (!credentials.username.trim() || !credentials.password.trim()) {
      toast({
        title: 'Missing credentials',
        description: 'Please enter both username/email and password.',
        variant: 'destructive',
      })
      return
    }

    const response = await fetch('/api/staff/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: credentials.username.trim(),
        password: credentials.password,
      }),
    })

    const result = await response.json()

    if (!response.ok || !result?.data) {
      const message = result?.error || 'Invalid username/email or password. Please contact the doctor for correct credentials.'
      toast({
        title: '❌ Authentication Failed',
        description: message,
        variant: 'destructive',
      })
      return
    }

    const staff = result.data as { id: string; username: string; display_name?: string | null; role?: string | null }

    // Persist minimal session info on this device only
    localStorage.setItem('staff_authenticated', 'true')
    localStorage.setItem('staff_login_time', new Date().toISOString())
    localStorage.setItem('staff_username', staff.username)
    localStorage.setItem('staff_user_id', staff.id)
    if (staff.display_name) localStorage.setItem('staff_display_name', staff.display_name)
    if (staff.role) localStorage.setItem('staff_role', staff.role)

    setIsAuthenticated(true)
    setStaffUsername(staff.display_name || staff.username)
    setStaffUserId(staff.id)

    await loadPatientData()
    setupSessionTimeout()

    toast({
      title: '✅ Authentication Successful',
      description: `Welcome ${staff.display_name || staff.username}. You have read-only access to patient data.`,
    })
  } catch (error) {
    console.error('Authentication error:', error)
    toast({
      title: 'Error',
      description: 'Authentication system error. Please try again.',
      variant: 'destructive',
    })
  } finally {
    setAuthLoading(false)
  }
}

  // Staff logout
  const handleStaffLogout = async () => {
    // Create security event for logout
    try {
      const staffUserId = localStorage.getItem('staff_user_id')
      if (staffUserId) {
        await deviceSecurity.createSecurityEvent(staffUserId, 'logout')
      }
    } catch (securityError) {
      console.warn('Failed to create logout security event:', securityError)
      // Don't block logout if security tracking fails
    }

    localStorage.removeItem('staff_authenticated')
    localStorage.removeItem('staff_login_time')
    localStorage.removeItem('staff_username')
    localStorage.removeItem('staff_user_id')
    
    if (sessionTimeout) clearTimeout(sessionTimeout)
    
    setIsAuthenticated(false)
    setCredentials({ username: '', password: '' })
    setStaffUsername('')
    setStaffUserId('')
    setPatients([])
    setFilteredPatients([])
    
    toast({
      title: '👋 Logged Out',
      description: 'You have been successfully logged out.',
    })
  }

  // Filter patients based on search + status + urgency + high‑level date filter
  useEffect(() => {
    let filtered = patients

    // Date filters: All / Today / Next 7 Days
    const today = new Date()
    const todayStr = today.toDateString()
    const sevenDaysFromNow = new Date(today)
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

    if (dateFilter === 'today') {
      filtered = filtered.filter(
        (patient) => new Date(patient.appointment_date).toDateString() === todayStr,
      )
    } else if (dateFilter === 'next') {
      filtered = filtered.filter((patient) => {
        const d = new Date(patient.appointment_date)
        if (Number.isNaN(d.getTime())) return false
        return d >= today && d <= sevenDaysFromNow
      })
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (patient) =>
          patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.phone.includes(searchTerm) ||
          (patient.email &&
            patient.email.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (statusFilter) {
      filtered = filtered.filter((patient) => patient.status === statusFilter)
    }

    if (urgencyFilter) {
      filtered = filtered.filter((patient) => patient.urgency === urgencyFilter)
    }

    setFilteredPatients(filtered)
  }, [patients, searchTerm, statusFilter, urgencyFilter, dateFilter])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setupSessionTimeout() // Reset session timeout on activity
    await loadPatientData()
    setIsRefreshing(false)
  }

  // Memoized derived collections for quick filters (read-only)
  const todayPatients = useMemo(() => {
    const todayStr = new Date().toDateString()
    return filteredPatients.filter((p) => new Date(p.appointment_date).toDateString() === todayStr)
  }, [filteredPatients])

  const urgentPatients = useMemo(() => {
    return filteredPatients.filter((p) => p.urgency === 'urgent' || p.urgency === 'emergency')
  }, [filteredPatients])

  // Next upcoming appointment (for "Next" highlight card)
  const nextUpcomingAppointment = useMemo(() => {
    if (!patients.length) return null
    const now = new Date()
    return (
      patients
        .filter((p) => {
          const d = new Date(p.appointment_date)
          return !Number.isNaN(d.getTime()) && d.getTime() >= now.getTime()
        })
        .sort(
          (a, b) =>
            new Date(a.appointment_date).getTime() -
            new Date(b.appointment_date).getTime(),
        )[0] || null
    )
  }, [patients])

  // Get urgency color for badges
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-100 text-red-800'
      case 'urgent': return 'bg-orange-100 text-orange-800' 
      case 'normal': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[rgb(174,193,192)] via-[rgb(220,230,229)] to-[rgb(174,193,192)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0d5c75] mx-auto mb-4" />
          <p className="text-[#0d5c75]">Loading staff dashboard...</p>
        </div>
      </div>
    )
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[rgb(174,193,192)] to-white flex items-center justify-center p-4">
        {/* Main Authentication Card */}
        <div className="w-full max-w-md">
          <Card className="bg-white/98 backdrop-blur-xl shadow-2xl border-[#0d5c75]/15 rounded-2xl overflow-hidden">
            {/* Header with Logo */}
            <CardHeader className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white px-5 py-4 text-center relative">
              <div className="relative z-10">
                {/* Logo */}
                <div className="w-14 h-14 mx-auto mb-2.5 relative">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
                    <Image
                      src="/images/gonstead-chiropractic-logo-new.png"
                      alt="Gonstead Logo"
                      width={36}
                      height={36}
                      className="object-contain"
                    />
                  </div>
                  {/* Staff Badge */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-[rgb(227,252,236)] to-white rounded-full flex items-center justify-center shadow-lg">
                    <Shield className="h-3 w-3 text-[#0d5c75]" />
                  </div>
                </div>
                
                <CardTitle className="text-lg font-semibold mb-0.5">Staff Portal</CardTitle>
                <p className="text-white/90 text-[11px]">Gonstead Chiropractic Clinic</p>
              </div>
            </CardHeader>

            <CardContent className="px-6 py-5">
              {/* Clinic time widget – optimized for all screen sizes */}
              <div className="mb-5 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-slate-50 px-4 py-3 shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#0d5c75] text-white shadow-md">
                    <Clock3 className="h-4 w-4" />
                  </div>
                  <p className="text-[11px] font-semibold text-emerald-800 tracking-[0.18em] uppercase">
                    Clinic time
                  </p>
                  <span
                    className={`inline-flex h-2.5 w-2.5 rounded-full ${
                      clinicStatus === 'open_now'
                        ? 'bg-emerald-400'
                        : clinicStatus === 'closed_day' || clinicStatus === 'closed_now'
                        ? 'bg-red-400'
                        : 'bg-gray-300'
                    }`}
                  />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                    {clinicStatus === 'open_now'
                      ? 'ON'
                      : clinicStatus === 'closed_day'
                      ? 'OFF DAY'
                      : clinicStatus === 'closed_now'
                      ? 'OFF TIME'
                      : 'UNKNOWN'}
                  </span>
                </div>
                <div className="flex flex-col items-center text-center gap-1">
                  <p className="text-sm sm:text-base font-semibold text-slate-900">
                    {formatDate(currentTime)}
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-slate-900 tabular-nums">
                    {formatTime12Hour(currentTime)}
                  </p>
                </div>
              </div>

              <form onSubmit={handleStaffLogin} className="space-y-3.5">
                {/* Username or Email Field */}
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-xs text-[#0d5c75] font-medium">Username or Email</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username or email"
                      value={credentials.username}
                      onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                      className="pl-10 h-9 text-sm border border-gray-200 focus:border-[#0d5c75] rounded-lg"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs text-[#0d5c75] font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={credentials.password}
                      onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10 pr-9 h-9 text-sm border border-gray-200 focus:border-[#0d5c75] rounded-lg"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] hover:from-[#0a4a5c] hover:to-[#238a7a] text-white text-sm font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                >
                  {authLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>Access Staff Dashboard</span>
                    </div>
                  )}
                </Button>

              </form>
            </CardContent>

            {/* Footer */}
            <div className="bg-gray-50 px-5 py-2.5 text-center">
              <p className="text-[11px] text-gray-600">Gonstead Chiropractic Clinic Staff Portal</p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-full flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Staff Dashboard</h1>
                <p className="text-sm text-gray-600">Gonstead Chiropractic Clinic</p>
              </div>
            </div>

            {/* User Info and Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 text-gray-500 hover:text-emerald-600 transition-colors"
                title="Refresh patient data"
              >
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  {staffUsername || 'Staff User'}
                </p>
                <div className="flex items-center justify-end gap-1 text-xs text-gray-500">
                  <span
                    className={`inline-flex h-2 w-2 rounded-full ${
                      clinicStatus === 'open_now'
                        ? 'bg-emerald-500'
                        : clinicStatus === 'closed_day' || clinicStatus === 'closed_now'
                        ? 'bg-red-500'
                        : 'bg-gray-400'
                    }`}
                  />
                  <span>
                    {clinicStatus === 'open_now'
                      ? 'Clinic ON · open now'
                      : clinicStatus === 'closed_day'
                      ? 'Clinic OFF · off day'
                      : clinicStatus === 'closed_now'
                      ? 'Clinic OFF · closed now'
                      : 'Clinic status unknown'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleStaffLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-red-600 transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search, Filters, and Quick Stats */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients by name, phone, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Date quick filters */}
            <div className="flex flex-wrap gap-3 mb-3 lg:mb-0">
              <button
                type="button"
                onClick={() => setDateFilter('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  dateFilter === 'all'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-emerald-50'
                }`}
              >
                All Appointments
              </button>
              <button
                type="button"
                onClick={() => setDateFilter('today')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  dateFilter === 'today'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-emerald-50'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setDateFilter('next')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  dateFilter === 'next'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-emerald-50'
                }`}
              >
                Next 7 Days
              </button>
            </div>

            {/* Status / urgency filters */}
            <div className="flex flex-wrap gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              >
                <option value="">All Urgency</option>
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
          </div>

          {/* Next appointment highlight + Summary Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
            {/* Next upcoming appointment card */}
            <div className="lg:col-span-2">
              <div className="h-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                  <Calendar className="h-5 w-5" />
                </div>
                {nextUpcomingAppointment ? (
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold">
                      Next Appointment
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {nextUpcomingAppointment.name}{' '}
                      <span className="text-xs font-normal text-gray-500">
                        ({nextUpcomingAppointment.session_type === 'in_clinic'
                          ? 'In-Clinic'
                          : 'Video'})
                      </span>
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(nextUpcomingAppointment.appointment_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      •{' '}
                      {new Date(nextUpcomingAppointment.appointment_date).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </p>
                  </div>
                ) : (
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold">
                      Next Appointment
                    </p>
                    <p className="text-sm text-gray-600">No upcoming appointments found.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Compact summary stats */}
            <div className="grid grid-cols-2 gap-4 lg:col-span-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{filteredPatients.length}</div>
                <div className="text-sm text-gray-500">Showing Patients</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {todayPatients.length}
                </div>
                <div className="text-sm text-gray-500">Today&apos;s Appointments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {urgentPatients.length}
                </div>
                <div className="text-sm text-gray-500">Urgent / Emergency</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredPatients.filter((patient) => patient.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Patient List - Read Only */}
        <div className="space-y-4">
          {filteredPatients.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter || urgencyFilter
                  ? 'Try adjusting your search or filters'
                  : 'No patients available'}
              </p>
            </div>
          ) : (
            filteredPatients.map((patient) => {
              const StatusIcon = statusIcons[patient.status] || Clock3
              return (
                <div key={patient.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-l-emerald-500">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Patient Info */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                        <User className="h-5 w-5 text-emerald-600" />
                        <span>{patient.name}</span>
                        <Badge variant="outline" className="text-xs">
                          READ-only
                        </Badge>
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 flex-shrink-0 text-blue-500" />
                          <a href={`tel:${patient.phone}`} className="text-blue-700 hover:underline">
                            {patient.phone}
                          </a>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 flex-shrink-0 text-blue-500" />
                          <a
                            href={patient.email ? `mailto:${patient.email}` : undefined}
                            className={patient.email ? 'text-blue-700 hover:underline' : 'text-gray-400'}
                          >
                            {patient.email || 'No email provided'}
                          </a>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 flex-shrink-0 text-purple-500" />
                          <span className="text-xs">ID: {patient.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </div>

                    {/* Appointment Details */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <span className="font-medium">
                          {new Date(patient.appointment_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <span className="font-medium">
                          {new Date(patient.appointment_date).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Stethoscope className="h-5 w-5 text-gray-400" />
                        <span className="font-medium">
                          {patient.session_type === 'in_clinic' ? 'In-Clinic Treatment' : 'Video Consultation'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Sessions: {patient.sessions_completed || 0} completed
                      </p>
                      <p className="text-sm text-gray-600">
                        Payment: {(patient.payment_method || 'cash').toUpperCase()}
                      </p>
                    </div>

                    {/* Status and Notes */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <StatusIcon className="h-5 w-5" />
                        <Badge className={statusColors[patient.status || 'pending'] || 'bg-gray-100 text-gray-800'}>
                          {(patient.status || 'pending').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4" />
                        <Badge className={getUrgencyColor(patient.urgency || 'normal')}>
                          {(patient.urgency || 'normal').toUpperCase()}
                        </Badge>
                      </div>
                      {patient.notes && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Notes: </span>
                            {patient.notes}
                          </p>
                        </div>
                      )}
                      {patient.last_visit && (
                        <div className="text-xs text-gray-500">
                          Last visit: {new Date(patient.last_visit).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-emerald-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>© 2024 Gonstead Chiropractic Clinic. All rights reserved.</p>
            <p className="mt-1">Staff Portal - Read-only Patient Data Access</p>
            <p className="mt-2 text-xs text-gray-400">Real-time updates • Session expires in 30 minutes of inactivity</p>
          </div>
        </div>
      </div>

      {/* Staff PWA install prompt - only on staff routes */}
      <StaffServiceWorkerClient />
      
      {/* Real-Time Staff-Patient-Doctor WhatsApp Chat Interface */}
      <StaffWhatsAppChatInbox staffUsername={staffUsername || 'Staff Member'} />
      
      {/* Scroll to Top Button */}
      <StaffScrollToTopButton showAfter={300} />
    </div>
  )
}
