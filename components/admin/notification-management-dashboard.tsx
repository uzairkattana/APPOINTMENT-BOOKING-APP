"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell,
  BellRing,
  Clock,
  Users,
  Calendar,
  Settings,
  AlertTriangle,
  CheckCircle,
  Send,
  History,
  Filter,
  Search,
  Plus,
  Edit3,
  Trash2,
  Play,
  Pause,
  RefreshCw,
  Download,
  Upload,
  Eye,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  MessageSquare,
  Activity,
  Target,
  TrendingUp,
  BarChart3,
  Zap,
  Timer,
  UserCheck,
  PhoneCall,
  ClockIcon,
  MapPin,
  Star
} from "lucide-react"
import { useSettings, useNotificationSettings } from "@/lib/settings-context"
import { useNotifications, type NotificationData } from "@/components/doctor-notifications"
import { useToast } from "@/hooks/use-toast"

interface NotificationTemplate {
  id: string
  name: string
  type: "appointment" | "reminder" | "emergency" | "system"
  subject: string
  content: string
  channels: ("app" | "sms" | "email" | "whatsapp")[]
  isActive: boolean
  variables: string[]
  createdAt: Date
  lastModified: Date
}

interface NotificationSchedule {
  id: string
  templateId: string
  patientFilter: string
  sendTime: string
  frequency: "once" | "daily" | "weekly" | "monthly"
  isActive: boolean
  nextRun: Date
  lastRun?: Date
  successCount: number
  failureCount: number
}

interface NotificationLog {
  id: string
  type: "sent" | "failed" | "queued" | "delivered"
  templateId?: string
  patientName: string
  patientPhone: string
  channel: string
  message: string
  timestamp: Date
  status: "success" | "failed" | "pending"
  errorMessage?: string
}

interface NotificationStats {
  totalSent: number
  deliveryRate: number
  responseRate: number
  channelBreakdown: {
    app: number
    sms: number
    email: number
    whatsapp: number
  }
  typeBreakdown: {
    appointment: number
    reminder: number
    emergency: number
    system: number
  }
}

export function NotificationManagementDashboard() {
  const { settings } = useSettings()
  const { notifications: notificationSettings, updateNotification } = useNotificationSettings()
  const { addNotification } = useNotifications()
  const { toast } = useToast()

  // State management
  const [activeTab, setActiveTab] = useState("overview")
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [schedules, setSchedules] = useState<NotificationSchedule[]>([])
  const [logs, setLogs] = useState<NotificationLog[]>([])
  const [stats, setStats] = useState<NotificationStats>({
    totalSent: 1247,
    deliveryRate: 94.2,
    responseRate: 78.5,
    channelBreakdown: { app: 542, sms: 321, email: 234, whatsapp: 150 },
    typeBreakdown: { appointment: 678, reminder: 345, emergency: 123, system: 101 }
  })

  // Filters and search
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [dateRange, setDateRange] = useState("today")

  // Dialog states
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false)
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null)
  const [isTestingTemplate, setIsTestingTemplate] = useState(false)

  // Form states
  const [newTemplate, setNewTemplate] = useState<Partial<NotificationTemplate>>({
    name: "",
    type: "appointment",
    subject: "",
    content: "",
    channels: ["app"],
    variables: [],
    isActive: true
  })

  // Load initial data
  useEffect(() => {
    loadTemplates()
    loadSchedules()
    loadLogs()
  }, [])

  // Mock data loading functions
  const loadTemplates = () => {
    const mockTemplates: NotificationTemplate[] = [
      {
        id: "tpl-1",
        name: "New Appointment Confirmation",
        type: "appointment",
        subject: "Appointment Confirmed - Dr. Bashir",
        content: "Dear {{patientName}}, your appointment has been confirmed for {{appointmentDate}} at {{appointmentTime}}. Appointment ID: {{appointmentId}}",
        channels: ["app", "sms", "email"],
        isActive: true,
        variables: ["patientName", "appointmentDate", "appointmentTime", "appointmentId"],
        createdAt: new Date("2024-01-15"),
        lastModified: new Date("2024-01-20")
      },
      {
        id: "tpl-2",
        name: "Appointment Reminder - 24 Hours",
        type: "reminder",
        subject: "Reminder: Appointment Tomorrow",
        content: "Hi {{patientName}}, this is a reminder that you have an appointment tomorrow at {{appointmentTime}}. Please call {{clinicPhone}} if you need to reschedule.",
        channels: ["app", "sms", "whatsapp"],
        isActive: true,
        variables: ["patientName", "appointmentTime", "clinicPhone"],
        createdAt: new Date("2024-01-10"),
        lastModified: new Date("2024-01-18")
      },
      {
        id: "tpl-3",
        name: "Emergency Alert Protocol",
        type: "emergency",
        subject: "URGENT: Emergency Patient Alert",
        content: "EMERGENCY PATIENT ALERT: {{patientName}} requires immediate attention. Contact: {{patientPhone}}. Priority: {{urgencyLevel}}",
        channels: ["app"],
        isActive: true,
        variables: ["patientName", "patientPhone", "urgencyLevel"],
        createdAt: new Date("2024-01-05"),
        lastModified: new Date("2024-01-15")
      }
    ]
    setTemplates(mockTemplates)
  }

  const loadSchedules = () => {
    const mockSchedules: NotificationSchedule[] = [
      {
        id: "sch-1",
        templateId: "tpl-2",
        patientFilter: "upcoming_appointments",
        sendTime: "18:00",
        frequency: "daily",
        isActive: true,
        nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000),
        lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
        successCount: 45,
        failureCount: 2
      }
    ]
    setSchedules(mockSchedules)
  }

  const loadLogs = () => {
    const mockLogs: NotificationLog[] = [
      {
        id: "log-1",
        type: "sent",
        templateId: "tpl-1",
        patientName: "Ahmad Khan",
        patientPhone: "+92 300 1234567",
        channel: "app",
        message: "Appointment confirmed for tomorrow at 2:00 PM",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: "success"
      },
      {
        id: "log-2",
        type: "failed",
        templateId: "tpl-2",
        patientName: "Sarah Ahmed",
        patientPhone: "+92 321 9876543",
        channel: "sms",
        message: "Reminder: Appointment tomorrow",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        status: "failed",
        errorMessage: "SMS delivery failed - invalid number"
      }
    ]
    setLogs(mockLogs)
  }

  // Template management
  const createTemplate = () => {
    if (!newTemplate.name || !newTemplate.content) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    const template: NotificationTemplate = {
      ...newTemplate,
      id: `tpl-${Date.now()}`,
      createdAt: new Date(),
      lastModified: new Date(),
      variables: extractVariables(newTemplate.content || "")
    } as NotificationTemplate

    setTemplates(prev => [template, ...prev])
    setIsCreatingTemplate(false)
    setNewTemplate({
      name: "",
      type: "appointment",
      subject: "",
      content: "",
      channels: ["app"],
      variables: [],
      isActive: true
    })

    toast({
      title: "Template Created",
      description: `Template "${template.name}" has been created successfully`,
      className: "border-green-500 bg-green-50"
    })
  }

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{\{([^}]+)\}\}/g)
    return matches ? matches.map(match => match.replace(/[{}]/g, '')) : []
  }

  const testTemplate = async (template: NotificationTemplate) => {
    setIsTestingTemplate(true)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Create a test notification
      addNotification({
        type: template.type,
        patientName: "Test Patient",
        appointmentId: "TEST-123",
        phoneNumber: "+92 300 1234567",
        appointmentTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        urgency: template.type === "emergency" ? "emergency" : "normal",
        message: template.content.replace(/\{\{([^}]+)\}\}/g, "TEST_VALUE")
      })

      toast({
        title: "Test Sent Successfully",
        description: `Test notification sent using template "${template.name}"`,
        className: "border-blue-500 bg-blue-50"
      })
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to send test notification",
        variant: "destructive"
      })
    } finally {
      setIsTestingTemplate(false)
    }
  }

  const toggleTemplate = (templateId: string) => {
    setTemplates(prev =>
      prev.map(t => t.id === templateId ? { ...t, isActive: !t.isActive } : t)
    )
  }

  const deleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId))
    toast({
      title: "Template Deleted",
      description: "Template has been removed successfully"
    })
  }

  // Real-time notification sender
  const sendImmediateNotification = () => {
    addNotification({
      type: "appointment",
      patientName: "John Smith",
      appointmentId: `APT-${Date.now().toString().slice(-6)}`,
      phoneNumber: "+92 300 9876543",
      appointmentTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      urgency: "normal",
      message: "New appointment scheduled - please review"
    })

    toast({
      title: "Notification Sent",
      description: "Real-time notification sent to doctors",
      className: "border-blue-500 bg-blue-50"
    })
  }

  // Filtered data
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || template.type === filterType
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && template.isActive) ||
                         (filterStatus === "inactive" && !template.isActive)
    return matchesSearch && matchesType && matchesStatus
  })

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || log.channel === filterType
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notification Management Center</h1>
          <p className="text-gray-600">Comprehensive notification system control and monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={sendImmediateNotification}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4 mr-2" />
            Test Notification
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Settings
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Sent Today</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalSent}</p>
                </div>
                <Bell className="h-8 w-8 text-blue-500" />
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% from yesterday
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Delivery Rate</p>
                  <p className="text-2xl font-bold text-green-900">{stats.deliveryRate}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  <Target className="h-3 w-3 mr-1" />
                  Above target
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">Active Templates</p>
                  <p className="text-2xl font-bold text-orange-900">{templates.filter(t => t.isActive).length}</p>
                </div>
                <Edit3 className="h-8 w-8 text-orange-500" />
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  {templates.length} total templates
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Response Rate</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.responseRate}%</p>
                </div>
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  Real-time tracking
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Channel Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Channel Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.channelBreakdown).map(([channel, count]) => (
                    <div key={channel} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {channel === "app" && <Smartphone className="h-4 w-4 text-blue-500" />}
                        {channel === "sms" && <MessageSquare className="h-4 w-4 text-green-500" />}
                        {channel === "email" && <Mail className="h-4 w-4 text-orange-500" />}
                        {channel === "whatsapp" && <PhoneCall className="h-4 w-4 text-emerald-500" />}
                        <span className="font-medium capitalize">{channel}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{count}</span>
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              channel === "app" ? "bg-blue-500" :
                              channel === "sms" ? "bg-green-500" :
                              channel === "email" ? "bg-orange-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${(count / stats.totalSent) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Type Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-600" />
                  Notification Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.typeBreakdown).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {type === "appointment" && <Calendar className="h-4 w-4 text-blue-500" />}
                        {type === "reminder" && <Clock className="h-4 w-4 text-yellow-500" />}
                        {type === "emergency" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                        {type === "system" && <Settings className="h-4 w-4 text-gray-500" />}
                        <span className="font-medium capitalize">{type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{count}</span>
                        <Badge
                          variant={
                            type === "emergency" ? "destructive" :
                            type === "appointment" ? "default" :
                            type === "reminder" ? "secondary" : "outline"
                          }
                          className="text-xs"
                        >
                          {((count / stats.totalSent) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-gray-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {logs.slice(0, 10).map((log, index) => (
                    <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <div className={`w-2 h-2 rounded-full ${
                        log.status === "success" ? "bg-green-500" :
                        log.status === "failed" ? "bg-red-500" : "bg-yellow-500"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{log.patientName}</p>
                        <p className="text-xs text-gray-600 truncate">{log.message}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </p>
                        <Badge
                          variant={log.status === "success" ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {log.channel}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          {/* Template Controls */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-blue-600" />
                  Notification Templates
                </CardTitle>
                <Button onClick={() => setIsCreatingTemplate(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="appointment">Appointment</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {filteredTemplates.map((template) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Card className={`border-l-4 ${
                        template.type === "emergency" ? "border-l-red-500" :
                        template.type === "appointment" ? "border-l-blue-500" :
                        template.type === "reminder" ? "border-l-yellow-500" : "border-l-gray-500"
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg">{template.name}</h3>
                                <Badge
                                  variant={
                                    template.type === "emergency" ? "destructive" :
                                    template.type === "appointment" ? "default" :
                                    template.type === "reminder" ? "secondary" : "outline"
                                  }
                                >
                                  {template.type}
                                </Badge>
                                <Switch
                                  checked={template.isActive}
                                  onCheckedChange={() => toggleTemplate(template.id)}
                                />
                              </div>
                              <p className="text-gray-600 text-sm mb-2">{template.subject}</p>
                              <p className="text-gray-800 text-sm bg-gray-50 p-2 rounded">
                                {template.content}
                              </p>
                              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                <span>Channels: {template.channels.join(", ")}</span>
                                <span>Variables: {template.variables.length}</span>
                                <span>Modified: {new Date(template.lastModified).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => testTemplate(template)}
                                disabled={isTestingTemplate}
                              >
                                {isTestingTemplate ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedTemplate(template)
                                  setNewTemplate(template)
                                  setIsCreatingTemplate(true)
                                }}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteTemplate(template.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-600" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Global Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Display Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Enable Notifications</Label>
                      <Switch
                        checked={notificationSettings.enabled}
                        onCheckedChange={(value) => updateNotification("enabled", value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Sound Notifications</Label>
                      <Switch
                        checked={notificationSettings.sound}
                        onCheckedChange={(value) => updateNotification("sound", value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Vibration</Label>
                      <Switch
                        checked={notificationSettings.vibration}
                        onCheckedChange={(value) => updateNotification("vibration", value)}
                      />
                    </div>
                    <div>
                      <Label>Display Duration (seconds)</Label>
                      <Input
                        type="number"
                        value={notificationSettings.duration}
                        onChange={(e) => updateNotification("duration", parseInt(e.target.value))}
                        min={1}
                        max={30}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Max Visible Notifications</Label>
                      <Input
                        type="number"
                        value={notificationSettings.maxVisible}
                        onChange={(e) => updateNotification("maxVisible", parseInt(e.target.value))}
                        min={1}
                        max={10}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Emergency Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Emergency Alerts</Label>
                      <Switch
                        checked={notificationSettings.emergencyNotifications.enabled}
                        onCheckedChange={(value) => updateNotification("emergencyNotifications.enabled", value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Immediate Alert</Label>
                      <Switch
                        checked={notificationSettings.emergencyNotifications.immediateAlert}
                        onCheckedChange={(value) => updateNotification("emergencyNotifications.immediateAlert", value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Persist Until Acknowledged</Label>
                      <Switch
                        checked={notificationSettings.emergencyNotifications.persistUntilAcknowledged}
                        onCheckedChange={(value) => updateNotification("emergencyNotifications.persistUntilAcknowledged", value)}
                      />
                    </div>
                    <div>
                      <Label>Escalation Time (minutes)</Label>
                      <Input
                        type="number"
                        value={notificationSettings.emergencyNotifications.escalationTime}
                        onChange={(e) => updateNotification("emergencyNotifications.escalationTime", parseInt(e.target.value))}
                        min={1}
                        max={60}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Urgency Filters */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Priority Filters</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={notificationSettings.urgencyFilters.normal}
                      onCheckedChange={(value) => updateNotification("urgencyFilters.normal", value)}
                    />
                    <Label>Normal Priority</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={notificationSettings.urgencyFilters.urgent}
                      onCheckedChange={(value) => updateNotification("urgencyFilters.urgent", value)}
                    />
                    <Label>Urgent Priority</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={notificationSettings.urgencyFilters.emergency}
                      onCheckedChange={(value) => updateNotification("urgencyFilters.emergency", value)}
                    />
                    <Label>Emergency Priority</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Template Dialog */}
      <Dialog open={isCreatingTemplate} onOpenChange={setIsCreatingTemplate}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? "Edit Template" : "Create New Template"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Template Name</Label>
              <Input
                value={newTemplate.name}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter template name"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select
                  value={newTemplate.type}
                  onValueChange={(value: any) => setNewTemplate(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appointment">Appointment</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <div className="flex items-center mt-3">
                  <Switch
                    checked={newTemplate.isActive}
                    onCheckedChange={(value) => setNewTemplate(prev => ({ ...prev, isActive: value }))}
                  />
                  <Label className="ml-2">Active</Label>
                </div>
              </div>
            </div>
            <div>
              <Label>Subject</Label>
              <Input
                value={newTemplate.subject}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter notification subject"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                value={newTemplate.content}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter notification content. Use {{variableName}} for dynamic values."
                rows={4}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Channels</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {(["app", "sms", "email", "whatsapp"] as const).map(channel => (
                  <div key={channel} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newTemplate.channels?.includes(channel)}
                      onChange={(e) => {
                        const channels = newTemplate.channels || []
                        if (e.target.checked) {
                          setNewTemplate(prev => ({ 
                            ...prev, 
                            channels: [...channels, channel] 
                          }))
                        } else {
                          setNewTemplate(prev => ({ 
                            ...prev, 
                            channels: channels.filter(c => c !== channel) 
                          }))
                        }
                      }}
                    />
                    <Label className="capitalize">{channel}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={createTemplate} className="flex-1">
                {selectedTemplate ? "Update Template" : "Create Template"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreatingTemplate(false)
                  setSelectedTemplate(null)
                  setNewTemplate({
                    name: "",
                    type: "appointment",
                    subject: "",
                    content: "",
                    channels: ["app"],
                    variables: [],
                    isActive: true
                  })
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
