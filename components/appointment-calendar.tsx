"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  Trash2,
  Video,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Plus,
  Search,
  CalendarDays,
  Grid3x3,
  List,
  Users,
  Activity,
  TrendingUp,
  BarChart3,
  Stethoscope,
  Heart,
  Zap,
  Star,
  Shield,
  Target,
  Sparkles
} from 'lucide-react'
import CalendarIcon from '@/components/icons/calendar-icon'
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// Types
interface Appointment {
  id: string
  name: string
  phone: string
  email?: string
  appointment_date: string
  session_type: 'in_clinic' | 'video'
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  urgency: 'normal' | 'urgent' | 'emergency'
  notes?: string
  doctor?: string
  treatment_type?: string
  duration?: number
}

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  backgroundColor: string
  borderColor: string
  textColor: string
  extendedProps: Appointment
}

interface AppointmentCalendarProps {
  appointments: Appointment[]
  onAppointmentClick?: (appointment: Appointment) => void
  onAppointmentUpdate?: (appointment: Appointment) => void
  onAppointmentDelete?: (id: string) => void
  isDarkMode?: boolean
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments = [],
  onAppointmentClick,
  onAppointmentUpdate,
  onAppointmentDelete,
  isDarkMode = false
}) => {
  // State management
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'list'>('month')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [filterDoctor, setFilterDoctor] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterUrgency, setFilterUrgency] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  })

  // Color schemes for different statuses
  const getStatusColor = (status: string, urgency: string) => {
    const colors = {
      pending: urgency === 'emergency' ? '#dc2626' : urgency === 'urgent' ? '#f59e0b' : '#6b7280',
      confirmed: urgency === 'emergency' ? '#dc2626' : urgency === 'urgent' ? '#f59e0b' : '#10b981',
      completed: '#059669',
      cancelled: '#ef4444'
    }
    return colors[status as keyof typeof colors] || colors.pending
  }

  // Convert appointments to calendar events
  const convertToCalendarEvents = useCallback((appointments: Appointment[]): CalendarEvent[] => {
    return appointments
      .filter(appointment => {
        const matchesDoctor = filterDoctor === 'all' || appointment.doctor === filterDoctor
        const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus
        const matchesUrgency = filterUrgency === 'all' || appointment.urgency === filterUrgency
        const matchesSearch = !searchTerm || 
          appointment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.phone.includes(searchTerm)
        
        return matchesDoctor && matchesStatus && matchesUrgency && matchesSearch
      })
      .map(appointment => {
        const startDate = new Date(appointment.appointment_date)
        const endDate = new Date(startDate.getTime() + (appointment.duration || 60) * 60000)
        const statusColor = getStatusColor(appointment.status, appointment.urgency)
        
        return {
          id: appointment.id,
          title: `${appointment.name} - ${appointment.session_type === 'video' ? '💻' : '🏥'}`,
          start: startDate,
          end: endDate,
          backgroundColor: statusColor,
          borderColor: statusColor,
          textColor: '#ffffff',
          extendedProps: appointment
        }
      })
  }, [filterDoctor, filterStatus, filterUrgency, searchTerm])

  // Calculate statistics
  const calculateStats = useCallback(() => {
    if (!appointments || !Array.isArray(appointments)) {
      setStats({ total: 0, today: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 })
      return
    }
    
    const today = new Date().toDateString()
    const stats = {
      total: appointments.length,
      today: appointments.filter(apt => new Date(apt.appointment_date).toDateString() === today).length,
      pending: appointments.filter(apt => apt.status === 'pending').length,
      confirmed: appointments.filter(apt => apt.status === 'confirmed').length,
      completed: appointments.filter(apt => apt.status === 'completed').length,
      cancelled: appointments.filter(apt => apt.status === 'cancelled').length
    }
    setStats(stats)
  }, [appointments])

  // Update calendar events when appointments or filters change
  useEffect(() => {
    setCalendarEvents(convertToCalendarEvents(appointments))
    calculateStats()
  }, [appointments, convertToCalendarEvents, calculateStats])

  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedAppointment(event.extendedProps)
    setShowModal(true)
    if (onAppointmentClick) {
      onAppointmentClick(event.extendedProps)
    }
  }

  // Handle appointment update
  const handleAppointmentUpdate = (updatedAppointment: Appointment) => {
    if (onAppointmentUpdate) {
      onAppointmentUpdate(updatedAppointment)
    }
    setShowModal(false)
    toast.success('Appointment updated successfully!')
  }

  // Handle appointment deletion
  const handleAppointmentDelete = (id: string) => {
    if (onAppointmentDelete) {
      onAppointmentDelete(id)
    }
    setShowModal(false)
    toast.success('Appointment deleted successfully!')
  }

  // Get unique doctors for filter
  const doctors = [...new Set(appointments.map(apt => apt.doctor).filter(Boolean))]

  // Calendar navigation
  const navigateCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    switch (viewMode) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
        break
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
        break
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
        break
    }
    setCurrentDate(newDate)
  }

  // Get calendar title
  const getCalendarTitle = () => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      ...(viewMode === 'day' && { day: 'numeric' })
    }
    return currentDate.toLocaleDateString('en-US', options)
  }

  // Render calendar grid for month view
  const renderMonthView = () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    const startOfWeek = new Date(startOfMonth)
    startOfWeek.setDate(startOfMonth.getDate() - startOfMonth.getDay())
    
    const days = []
    const currentDay = new Date(startOfWeek)

    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const dayEvents = calendarEvents.filter(event => 
        event.start.toDateString() === currentDay.toDateString()
      )
      
      days.push(
        <div
          key={i}
          className={cn(
            "min-h-[120px] p-2 border border-gray-200 dark:border-gray-700 transition-colors relative",
            currentDay.getMonth() !== currentDate.getMonth() && "bg-gray-50 dark:bg-gray-800/50 opacity-50",
            currentDay.toDateString() === new Date().toDateString() && "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600",
            currentDay.getDay() === 0 && "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-600"
          )}
        >
          <div className={cn(
            "text-sm font-medium mb-1",
            currentDay.toDateString() === new Date().toDateString() && "text-blue-600 dark:text-blue-400"
          )}>
            {currentDay.getDate()}
          </div>
          
          <div className="space-y-1">
            {/* Sunday Closure Notice */}
            {currentDay.getDay() === 0 && (
              <div className="text-xs p-2 rounded-lg bg-red-500/90 text-white font-medium border border-red-400 shadow-lg">
                <div className="text-center">
                  <div className="font-bold text-xs mb-1">🚫 CLINIC CLOSED</div>
                  <div className="text-xs opacity-90">Sunday - No Appointments</div>
                </div>
              </div>
            )}
            
            {dayEvents.slice(0, 3).map(event => (
              <div
                key={event.id}
                className={cn(
                  "text-xs p-2 rounded-lg cursor-pointer transition-all duration-200",
                  "text-white font-medium shadow-lg border border-white/20",
                  "hover:scale-105 hover:shadow-xl hover:border-white/40",
                  "relative overflow-hidden",
                  hoveredEvent === event.id && "scale-105 shadow-xl z-10"
                )}
                style={{ backgroundColor: event.backgroundColor }}
                onClick={() => handleEventClick(event)}
                onMouseEnter={() => setHoveredEvent(event.id)}
                onMouseLeave={() => setHoveredEvent(null)}
              >
                {/* Professional gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50"></div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-1.5 h-1.5 bg-white rounded-full opacity-80"></div>
                    <div className="truncate font-semibold text-xs">{event.extendedProps.name}</div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="opacity-90 font-medium">
                      {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="flex items-center gap-1">
                      {event.extendedProps.urgency === 'emergency' && (
                        <div className="w-2 h-2 bg-red-200 rounded-full animate-pulse"></div>
                      )}
                      {event.extendedProps.urgency === 'urgent' && (
                        <div className="w-2 h-2 bg-[rgb(227,252,236)] rounded-full"></div>
                      )}
                      <span className="text-xs opacity-75">
                        {event.extendedProps.session_type === 'video' ? '💻' : '🦴'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Status indicator line */}
                <div className={cn(
                  "absolute bottom-0 left-0 right-0 h-0.5",
                  event.extendedProps.status === 'completed' && "bg-emerald-300",
                  event.extendedProps.status === 'confirmed' && "bg-blue-300",
                  event.extendedProps.status === 'pending' && "bg-[rgb(227,252,236)]",
                  event.extendedProps.status === 'cancelled' && "bg-red-300"
                )}></div>
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                +{dayEvents.length - 3} more
              </div>
            )}
          </div>
        </div>
      )
      currentDay.setDate(currentDay.getDate() + 1)
    }

    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-[#0d5c75]/20 shadow-lg">
        {/* Professional Week Header */}
        <div className="grid grid-cols-7 bg-gradient-to-r from-[#0d5c75] via-[#1a6b7a] to-[#2a9d8f]">
          {[
            { name: 'Sunday', short: 'Sun' },
            { name: 'Monday', short: 'Mon' },
            { name: 'Tuesday', short: 'Tue' },
            { name: 'Wednesday', short: 'Wed' },
            { name: 'Thursday', short: 'Thu' },
            { name: 'Friday', short: 'Fri' },
            { name: 'Saturday', short: 'Sat' }
          ].map((day, index) => (
            <div key={day.name} className={cn(
              "p-4 text-center font-bold text-white border-r border-white/20 last:border-r-0",
              "bg-gradient-to-b from-white/10 to-transparent"
            )}>
              <div className="hidden md:block text-sm tracking-wide">{day.name}</div>
              <div className="md:hidden text-sm font-semibold">{day.short}</div>
              <div className="w-8 h-0.5 bg-white/30 mx-auto mt-1 rounded-full"></div>
            </div>
          ))}
        </div>
        
        {/* Enhanced Calendar Grid */}
        <div className="grid grid-cols-7">
          {days}
        </div>
      </div>
    )
  }

  // Render list view
  const renderListView = () => {
    const sortedEvents = [...calendarEvents].sort((a, b) => a.start.getTime() - b.start.getTime())
    
    return (
      <div className="space-y-2">
        {sortedEvents.map(event => (
          <Card
            key={event.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              hoveredEvent === event.id && "scale-105 shadow-lg"
            )}
            onClick={() => handleEventClick(event)}
            onMouseEnter={() => setHoveredEvent(event.id)}
            onMouseLeave={() => setHoveredEvent(null)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: event.backgroundColor }}
                  />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {event.extendedProps.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {event.start.toLocaleDateString()} at {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={event.extendedProps.status === 'completed' ? 'default' : 
                           event.extendedProps.status === 'confirmed' ? 'secondary' : 
                           event.extendedProps.status === 'cancelled' ? 'destructive' : 'outline'}
                  >
                    {event.extendedProps.status}
                  </Badge>
                  <Badge variant="outline">
                    {event.extendedProps.session_type === 'video' ? '💻 Video' : '🏥 Clinic'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {sortedEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
              No appointments found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your filters to see more appointments.
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Unique Gonstead Calendar Header */}
      <Card className="border-none shadow-2xl bg-gradient-to-br from-white via-[#f8fafc] to-[#e2e8f0] dark:from-gray-800 dark:via-gray-900 dark:to-gray-950 overflow-hidden relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 left-8 w-32 h-32 border-2 border-[#0d5c75] rounded-full animate-pulse"></div>
          <div className="absolute bottom-4 right-8 w-24 h-24 border-2 border-[#2a9d8f] rounded-full animate-pulse animation-delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 border-2 border-[rgb(227,252,236)] rounded-full animate-pulse animation-delay-2000"></div>
        </div>
        
        {/* Spine-inspired decorative elements */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#0d5c75] via-[#2a9d8f] to-[#f3a800] opacity-30"></div>
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[rgb(227,252,236)] via-[#2a9d8f] to-[#0d5c75] opacity-30"></div>
        
        <CardHeader className="relative z-10 bg-gradient-to-br from-[#0d5c75] via-[#1a6b7a] to-[#2a9d8f] text-white p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-lg animate-pulse"></div>
                <CalendarIcon 
                  variant="spine" 
                  size="xl" 
                  className="text-white relative z-10" 
                  animated={true}
                />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold mb-2 font-poppins">
                  🦴 Gonstead Appointment Calendar
                </CardTitle>
                <p className="text-white/80 text-sm font-medium tracking-wide">
                  Professional Chiropractic Scheduling System
                </p>
              </div>
            </div>
            
            {/* Medical Icons */}
            <div className="hidden md:flex items-center gap-4 opacity-60">
              <Stethoscope className="h-8 w-8 text-white/40 animate-pulse" />
              <Heart className="h-8 w-8 text-red-300 animate-pulse animation-delay-500" />
              <Shield className="h-8 w-8 text-white/40 animate-pulse animation-delay-1000" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#0d5c75]">{stats.total}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.pending}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Confirmed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{stats.completed}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Cancelled</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-3 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterUrgency} onValueChange={setFilterUrgency}>
                <SelectTrigger className="w-full md:w-[140px]">
                  <SelectValue placeholder="Urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgency</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>

              {doctors.length > 0 && (
                <Select value={filterDoctor} onValueChange={setFilterDoctor}>
                  <SelectTrigger className="w-full md:w-[140px]">
                    <SelectValue placeholder="Doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Doctors</SelectItem>
                    {doctors.map(doctor => (
                      <SelectItem key={doctor} value={doctor!}>
                        {doctor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('month')}
                className="flex items-center gap-2"
              >
                <Grid3x3 className="h-4 w-4" />
                Month
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex items-center gap-2"
              >
                <List className="h-4 w-4" />
                List
              </Button>
            </div>
          </div>

          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateCalendar('prev')}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                className="flex items-center gap-1"
              >
                <Calendar className="h-4 w-4" />
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateCalendar('next')}
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getCalendarTitle()}
            </h2>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLoading(true)}
                disabled={isLoading}
                className="flex items-center gap-1"
              >
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Content */}
      <Card className="border-[#0d5c75]/20 shadow-xl">
        <CardContent className="p-6">
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'list' && renderListView()}
        </CardContent>
      </Card>

      {/* Appointment Detail Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#0d5c75] font-bold text-xl flex items-center gap-2">
              <User className="h-5 w-5" />
              Appointment Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-6">
              {/* Patient Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Patient Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-500">Full Name</Label>
                      <p className="font-medium">{selectedAppointment.name}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Phone</Label>
                      <p className="font-medium flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {selectedAppointment.phone}
                      </p>
                    </div>
                    {selectedAppointment.email && (
                      <div>
                        <Label className="text-xs text-gray-500">Email</Label>
                        <p className="font-medium flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {selectedAppointment.email}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Appointment Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-500">Date & Time</Label>
                      <p className="font-medium">
                        {new Date(selectedAppointment.appointment_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(selectedAppointment.appointment_date).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Session Type</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant={selectedAppointment.session_type === 'video' ? 'secondary' : 'default'}>
                          {selectedAppointment.session_type === 'video' ? '💻 Video Call' : '🏥 In-Clinic'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Status</Label>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            selectedAppointment.status === 'completed' ? 'default' :
                            selectedAppointment.status === 'confirmed' ? 'secondary' :
                            selectedAppointment.status === 'cancelled' ? 'destructive' : 'outline'
                          }
                        >
                          {selectedAppointment.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {selectedAppointment.status === 'confirmed' && <UserCheck className="h-3 w-3 mr-1" />}
                          {selectedAppointment.status === 'cancelled' && <XCircle className="h-3 w-3 mr-1" />}
                          {selectedAppointment.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                          {selectedAppointment.status.toUpperCase()}
                        </Badge>
                        <Badge
                          variant={
                            selectedAppointment.urgency === 'emergency' ? 'destructive' :
                            selectedAppointment.urgency === 'urgent' ? 'secondary' : 'outline'
                          }
                        >
                          {selectedAppointment.urgency === 'emergency' && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {selectedAppointment.urgency.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Notes */}
              {selectedAppointment.notes && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-700">Clinical Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg border">
                      {selectedAppointment.notes}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 justify-end pt-4 border-t">
                {selectedAppointment.session_type === 'video' && (
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border-blue-500 text-blue-500 hover:bg-blue-50"
                  >
                    <Video className="h-4 w-4" />
                    Start Video Call
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-[rgb(227,252,236)] text-green-600 hover:bg-[rgb(227,252,236)]/10"
                  onClick={() => {
                    // Handle edit - you can implement edit functionality here
                    toast.info('Edit functionality can be implemented here')
                  }}
                >
                  <Edit3 className="h-4 w-4" />
                  Edit
                </Button>
                
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-red-500 text-red-500 hover:bg-red-50"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this appointment?')) {
                      handleAppointmentDelete(selectedAppointment.id)
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
                
                <Button
                  className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] hover:from-[#0a4a5c] hover:to-[#238a7a] text-white"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AppointmentCalendar
