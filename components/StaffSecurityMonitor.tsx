"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { 
  Shield, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Battery, 
  BatteryCharging, 
  Wifi, 
  WifiOff, 
  MapPin, 
  Globe, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Activity,
  Fingerprint,
  Eye,
  RefreshCw,
  Database,
  Lock,
  Unlock,
  UserCheck,
  TrendingUp,
  AlertCircle,
  Navigation,
  Server,
  Cpu,
  HardDrive,
  Globe2,
  ShieldCheck,
  ShieldAlert,
  Users,
  Calendar,
  Timer,
  Zap,
  Target,
  Radar,
  Router,
  ShieldOff,
  Fingerprint as FingerprintIcon
} from 'lucide-react'
import { DeviceInfo, MobileData, LocationData, SecurityEvent, NetworkData, BrowserDetails, SystemDetails, RiskFactors } from '@/lib/device-security'

interface StaffSecurityMonitorProps {
  staffId: string
  staffName: string
}

interface DeviceSession {
  id: string
  session_id: string
  device_fingerprint: string
  browser_fingerprint?: string
  device_info: DeviceInfo
  network_data?: NetworkData
  location_data?: LocationData
  browser_details?: BrowserDetails
  system_details?: SystemDetails
  is_active: boolean
  session_start: string
  last_activity: string
  session_duration: number
  page_views: number
  actions_performed: number
  security_flags: string[]
  suspicious_activities: number
  ip_address: string
  connection_type: string
  created_at: string
  expires_at: string
}

export default function StaffSecurityMonitor({ staffId, staffName }: StaffSecurityMonitorProps) {
  const { toast } = useToast()
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [activeSessions, setActiveSessions] = useState<DeviceSession[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null)

  useEffect(() => {
    loadSecurityData()
  }, [staffId])

  const loadSecurityData = async () => {
    setLoading(true)
    console.log('Loading security data for staff:', staffId)
    
    try {
      // Load security events
      try {
        const eventsResponse = await fetch(`/api/security-events?staff_id=${staffId}&limit=20`)
        console.log('Security events response status:', eventsResponse.status)
        
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json()
          console.log('Security events data:', eventsData)
          // Ensure we always have an array
          setSecurityEvents(Array.isArray(eventsData) ? eventsData : [])
        } else {
          console.warn('Security events API not available, status:', eventsResponse.status)
          const errorText = await eventsResponse.text()
          console.warn('Error response:', errorText)
          setSecurityEvents([])
        }
      } catch (error) {
        console.warn('Failed to load security events:', error)
        setSecurityEvents([])
      }

      // Load active sessions
      try {
        const sessionsResponse = await fetch(`/api/device-sessions?staff_id=${staffId}`)
        console.log('Device sessions response status:', sessionsResponse.status)
        
        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json()
          console.log('Device sessions data:', sessionsData)
          // Ensure we always have an array
          setActiveSessions(Array.isArray(sessionsData) ? sessionsData : [])
        } else {
          console.warn('Device sessions API not available, status:', sessionsResponse.status)
          const errorText = await sessionsResponse.text()
          console.warn('Error response:', errorText)
          setActiveSessions([])
        }
      } catch (error) {
        console.warn('Failed to load device sessions:', error)
        setActiveSessions([])
      }
    } catch (error) {
      console.error('Failed to load security data:', error)
      setSecurityEvents([])
      setActiveSessions([])
    } finally {
      setLoading(false)
    }
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="h-4 w-4" />
      case 'desktop': return <Monitor className="h-4 w-4" />
      case 'tablet': return <Tablet className="h-4 w-4" />
      default: return <Monitor className="h-4 w-4" />
    }
  }

  const getBatteryIcon = (batteryLevel?: number, charging?: boolean) => {
    if (!batteryLevel) return null
    
    if (charging) {
      return <BatteryCharging className="h-4 w-4 text-green-500" />
    }
    
    if (batteryLevel < 20) {
      return <Battery className="h-4 w-4 text-red-500" />
    } else if (batteryLevel < 50) {
      return <Battery className="h-4 w-4 text-yellow-500" />
    } else {
      return <Battery className="h-4 w-4 text-green-500" />
    }
  }

  const getConnectionIcon = (connectionType?: string) => {
    switch (connectionType) {
      case 'wifi': return <Wifi className="h-4 w-4 text-blue-500" />
      case 'cellular': return <Activity className="h-4 w-4 text-orange-500" />
      case 'ethernet': return <Activity className="h-4 w-4 text-green-500" />
      default: return <WifiOff className="h-4 w-4 text-gray-400" />
    }
  }

  const getSecurityLevelIcon = (level: string) => {
    switch (level) {
      case 'low': return <ShieldCheck className="h-4 w-4 text-green-500" />
      case 'normal': return <Shield className="h-4 w-4 text-blue-500" />
      case 'medium': return <ShieldAlert className="h-4 w-4 text-yellow-500" />
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Shield className="h-4 w-4 text-gray-500" />
    }
  }

  const getSecurityLevelBadge = (level: string) => {
    switch (level) {
      case 'low': return <Badge className="bg-green-100 text-green-800">Low Risk</Badge>
      case 'normal': return <Badge className="bg-blue-100 text-blue-800">Normal</Badge>
      case 'medium': return <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>
      case 'high': return <Badge className="bg-orange-100 text-orange-800">High Risk</Badge>
      case 'critical': return <Badge className="bg-red-100 text-red-800">Critical</Badge>
      default: return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const getAuthMethodIcon = (method: string) => {
    switch (method) {
      case 'password': return <Lock className="h-4 w-4 text-blue-500" />
      case 'mfa': return <Lock className="h-4 w-4 text-green-500" />
      case 'sso': return <Users className="h-4 w-4 text-purple-500" />
      case 'oauth': return <UserCheck className="h-4 w-4 text-orange-500" />
      default: return <Lock className="h-4 w-4 text-gray-500" />
    }
  }

  const getNetworkIcon = (type?: string) => {
    switch (type) {
      case 'wifi': return <Wifi className="h-4 w-4 text-blue-500" />
      case 'cellular': return <Router className="h-4 w-4 text-green-500" />
      case 'ethernet': return <Server className="h-4 w-4 text-gray-500" />
      default: return <WifiOff className="h-4 w-4 text-gray-400" />
    }
  }

  const getIpReputationBadge = (reputation: string) => {
    switch (reputation) {
      case 'safe': return <Badge className="bg-green-100 text-green-800">Safe</Badge>
      case 'suspicious': return <Badge className="bg-yellow-100 text-yellow-800">Suspicious</Badge>
      case 'malicious': return <Badge className="bg-red-100 text-red-800">Malicious</Badge>
      default: return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const getRiskBadge = (riskScore: number) => {
    if (riskScore >= 80) {
      return <Badge className="bg-red-100 text-red-800">Critical ({riskScore})</Badge>
    } else if (riskScore >= 60) {
      return <Badge className="bg-orange-100 text-orange-800">High ({riskScore})</Badge>
    } else if (riskScore >= 40) {
      return <Badge className="bg-yellow-100 text-yellow-800">Medium ({riskScore})</Badge>
    } else if (riskScore >= 20) {
      return <Badge className="bg-blue-100 text-blue-800">Low ({riskScore})</Badge>
    } else {
      return <Badge className="bg-green-100 text-green-800">Safe ({riskScore})</Badge>
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const generateSampleData = async () => {
    try {
      // Generate sample security event
      const sampleEvent = {
        staff_id: staffId,
        event_type: 'login',
        device_info: {
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          browser: 'Chrome',
          os: 'Windows',
          device_type: 'desktop' as const,
          screen_resolution: '1920x1080',
          language: 'en-US',
          timezone: 'America/New_York',
          device_fingerprint: 'sample-fingerprint-123'
        },
        mobile_data: {
          battery_level: 85,
          battery_charging: false,
          connection_type: 'wifi' as const,
          device_memory: 16,
          hardware_concurrency: 8,
          platform: 'Win32',
          device_pixel_ratio: 1,
          color_depth: 24
        },
        location_data: {
          country: 'United States',
          city: 'New York',
          region: 'NY',
          latitude: 40.7128,
          longitude: -74.0060,
          timezone_offset: '-300'
        },
        risk_score: 25,
        alerts: [],
        session_id: randomUUID()
      };

      const response = await fetch('/api/security-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sampleEvent)
      });

      if (response.ok) {
        toast({
          title: "Sample Data Generated",
          description: "Sample security event has been created successfully",
        });
        loadSecurityData(); // Reload the data
      } else {
        console.error('Failed to generate sample data');
      }
    } catch (error) {
      console.error('Error generating sample data:', error);
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  if (loading) {
    return (
      <Card className="bg-white shadow-lg border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Loading security data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Active Sessions */}
      <Card className="bg-white shadow-lg border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Active Sessions
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={generateSampleData}
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <Database className="h-4 w-4 mr-2" />
                Generate Sample Data
              </Button>
              <Button variant="outline" size="sm" onClick={loadSecurityData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activeSessions && activeSessions.length > 0 ? (
            <div className="space-y-4">
              {activeSessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getDeviceIcon(session.device_info?.device_type || 'desktop')}
                      <div>
                        <div className="font-medium text-gray-900">
                          {session.device_info?.browser || 'Unknown'} on {session.device_info?.os || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {session.device_info?.screen_resolution || 'Unknown'} • {session.ip_address || 'Unknown'}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={session.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                            {session.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Duration: {formatDuration(session.session_duration)}
                          </span>
                          <span className="text-xs text-gray-500">
                            Pages: {session.page_views} | Actions: {session.actions_performed}
                          </span>
                          {session.network_data && (
                            <>
                              {getNetworkIcon(session.network_data.connection_type)}
                              <span className="text-xs text-gray-600">{session.network_data.connection_type}</span>
                              {session.network_data.vpn_detected && <Badge className="bg-orange-100 text-orange-800 text-xs">VPN</Badge>}
                              {session.network_data.tor_detected && <Badge className="bg-red-100 text-red-800 text-xs">Tor</Badge>}
                              {getIpReputationBadge(session.network_data.ip_reputation)}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={session.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {session.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Session Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {/* Session Overview */}
                            <div className="grid grid-cols-4 gap-4">
                              <div>
                                <h4 className="font-medium mb-2">Status</h4>
                                <Badge className={session.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                  {session.is_active ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Duration</h4>
                                <div className="text-sm">{formatDuration(session.session_duration)}</div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Activity</h4>
                                <div className="text-sm">{session.page_views} pages, {session.actions_performed} actions</div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Security Flags</h4>
                                <div className="space-y-1">
                                  {(session.security_flags || []).map((flag, index) => (
                                    <Badge key={index} className="bg-yellow-100 text-yellow-800 text-xs">
                                      {flag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Enhanced Device Information */}
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <FingerprintIcon className="h-4 w-4" />
                                Enhanced Device Information
                              </h4>
                              <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                                <div className="space-y-2 text-sm">
                                  <div><strong>IP Address:</strong> {session.ip_address}</div>
                                  <div><strong>Browser:</strong> {session.device_info.browser}</div>
                                  <div><strong>OS:</strong> {session.device_info.os}</div>
                                  <div><strong>Device Type:</strong> {session.device_info.device_type}</div>
                                  <div><strong>Screen:</strong> {session.device_info.screen_resolution}</div>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div><strong>Language:</strong> {session.device_info.language}</div>
                                  <div><strong>Timezone:</strong> {session.device_info.timezone}</div>
                                  <div><strong>Device Fingerprint:</strong> <code className="text-xs bg-white px-1 rounded">{session.device_fingerprint}</code></div>
                                  {session.browser_fingerprint && (
                                    <div><strong>Browser Fingerprint:</strong> <code className="text-xs bg-white px-1 rounded">{session.browser_fingerprint}</code></div>
                                  )}
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div><strong>Session Start:</strong> {formatDateTime(session.session_start)}</div>
                                  <div><strong>Last Activity:</strong> {formatDateTime(session.last_activity)}</div>
                                  <div><strong>Expires:</strong> {formatDateTime(session.expires_at)}</div>
                                  <div><strong>Connection:</strong> {session.connection_type}</div>
                                </div>
                              </div>
                            </div>

                            {/* Network Data */}
                            {session.network_data && (
                              <div>
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                  <Globe2 className="h-4 w-4" />
                                  Network Information
                                </h4>
                                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                  <div className="space-y-2 text-sm">
                                    <div><strong>IP Address:</strong> {session.network_data.ip_address}</div>
                                    <div><strong>Connection Type:</strong> {session.network_data.connection_type}</div>
                                    <div><strong>Download Speed:</strong> {session.network_data.download_speed || 'N/A'} Mbps</div>
                                    <div><strong>Upload Speed:</strong> {session.network_data.upload_speed || 'N/A'} Mbps</div>
                                  </div>
                                  <div className="space-y-2 text-sm">
                                    <div><strong>Latency:</strong> {session.network_data.latency || 'N/A'} ms</div>
                                    <div><strong>VPN Detected:</strong> {session.network_data.vpn_detected ? 'Yes' : 'No'}</div>
                                    <div><strong>Tor Detected:</strong> {session.network_data.tor_detected ? 'Yes' : 'No'}</div>
                                    <div><strong>IP Reputation:</strong> {getIpReputationBadge(session.network_data.ip_reputation)}</div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Browser Details */}
                            {session.browser_details && (
                              <div>
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                  <Monitor className="h-4 w-4" />
                                  Browser Details
                                </h4>
                                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                  <div className="space-y-2 text-sm">
                                    <div><strong>Name:</strong> {session.browser_details.name}</div>
                                    <div><strong>Version:</strong> {session.browser_details.version}</div>
                                    <div><strong>Engine:</strong> {session.browser_details.engine}</div>
                                    <div><strong>Engine Version:</strong> {session.browser_details.engine_version}</div>
                                  </div>
                                  <div className="space-y-2 text-sm">
                                    <div><strong>Cookies Enabled:</strong> {session.browser_details.cookies_enabled ? 'Yes' : 'No'}</div>
                                    <div><strong>Do Not Track:</strong> {session.browser_details.do_not_track ? 'Yes' : 'No'}</div>
                                    <div><strong>Screen Orientation:</strong> {session.browser_details.screen_orientation}</div>
                                    <div><strong>Color Depth:</strong> {session.browser_details.color_depth} bits</div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* System Details */}
                            {session.system_details && (
                              <div>
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                  <Cpu className="h-4 w-4" />
                                  System Details
                                </h4>
                                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                  <div className="space-y-2 text-sm">
                                    <div><strong>Platform:</strong> {session.system_details.platform}</div>
                                    <div><strong>Platform Version:</strong> {session.system_details.platform_version}</div>
                                    <div><strong>Architecture:</strong> {session.system_details.architecture}</div>
                                    <div><strong>CPU Cores:</strong> {session.system_details.cpu_cores}</div>
                                  </div>
                                  <div className="space-y-2 text-sm">
                                    <div><strong>Memory:</strong> {session.system_details.memory} GB</div>
                                    <div><strong>Language:</strong> {session.system_details.language}</div>
                                    <div><strong>Timezone:</strong> {session.system_details.timezone}</div>
                                    <div><strong>Timezone Offset:</strong> {session.system_details.timezone_offset}</div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Monitor className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No active sessions found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Events */}
      <Card className="bg-white shadow-lg border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-600" />
            Recent Security Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {securityEvents && securityEvents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Security Level</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Auth Method</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {securityEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getSecurityLevelIcon(event.security_level)}
                        <span className="capitalize">{event.event_type.replace('_', ' ')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(event.device_info?.device_type || 'desktop')}
                        <span className="text-sm">{event.device_info?.browser || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getSecurityLevelBadge(event.security_level)}
                    </TableCell>
                    <TableCell>
                      {getRiskBadge(event.risk_score)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getAuthMethodIcon(event.auth_method)}
                        <span className="text-xs capitalize">{event.auth_method}</span>
                        {event.mfa_verified && <Badge className="bg-green-100 text-green-800 text-xs">MFA</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDateTime(event.timestamp)}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(event)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Enhanced Security Event Details</DialogTitle>
                          </DialogHeader>
                          {selectedEvent && (
                            <div className="space-y-6">
                              {/* Event Overview */}
                              <div className="grid grid-cols-4 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">Event Type</h4>
                                  <div className="flex items-center gap-2">
                                    {getSecurityLevelIcon(selectedEvent.security_level)}
                                    <Badge className="capitalize">{selectedEvent.event_type.replace('_', ' ')}</Badge>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Security Level</h4>
                                  {getSecurityLevelBadge(selectedEvent.security_level)}
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Risk Score</h4>
                                  {getRiskBadge(selectedEvent.risk_score)}
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Time</h4>
                                  <div className="text-sm">{formatDateTime(selectedEvent.timestamp)}</div>
                                </div>
                              </div>

                              {/* Authentication Details */}
                              <div>
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                  <Lock className="h-4 w-4" />
                                  Authentication Details
                                </h4>
                                <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                                  <div className="space-y-2 text-sm">
                                    <div><strong>Method:</strong> <span className="capitalize">{selectedEvent.auth_method}</span></div>
                                    <div><strong>MFA Verified:</strong> {selectedEvent.mfa_verified ? 'Yes' : 'No'}</div>
                                    <div><strong>Success:</strong> {selectedEvent.success ? 'Yes' : 'No'}</div>
                                  </div>
                                  <div className="space-y-2 text-sm">
                                    <div><strong>Session ID:</strong> <code className="text-xs bg-white px-1 rounded">{selectedEvent.session_id || 'N/A'}</code></div>
                                    <div><strong>Browser Fingerprint:</strong> <code className="text-xs bg-white px-1 rounded">{selectedEvent.browser_fingerprint || 'N/A'}</code></div>
                                    <div><strong>Device Fingerprint:</strong> <code className="text-xs bg-white px-1 rounded">{selectedEvent.device_fingerprint}</code></div>
                                  </div>
                                  <div className="space-y-2 text-sm">
                                    <div><strong>IP Reputation:</strong> {getIpReputationBadge(selectedEvent.ip_reputation)}</div>
                                    <div><strong>User Agent:</strong> <div className="text-xs bg-white px-1 rounded mt-1 truncate">{selectedEvent.user_agent}</div></div>
                                  </div>
                                </div>
                              </div>

                              {/* Risk Factors */}
                              {selectedEvent.risk_factors && selectedEvent.risk_factors.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <Target className="h-4 w-4" />
                                    Risk Factors
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {(selectedEvent.risk_factors || []).map((factor, index) => (
                                      <Badge key={index} className="bg-orange-100 text-orange-800">
                                        {factor.replace('_', ' ')}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Network Data */}
                              {selectedEvent.network_data && (
                                <div>
                                  <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <Globe2 className="h-4 w-4" />
                                    Network Information
                                  </h4>
                                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                    <div className="space-y-2 text-sm">
                                      <div><strong>IP Address:</strong> {selectedEvent.network_data.ip_address}</div>
                                      <div><strong>Connection Type:</strong> {selectedEvent.network_data.connection_type}</div>
                                      <div><strong>Download Speed:</strong> {selectedEvent.network_data.download_speed || 'N/A'} Mbps</div>
                                      <div><strong>Upload Speed:</strong> {selectedEvent.network_data.upload_speed || 'N/A'} Mbps</div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                      <div><strong>Latency:</strong> {selectedEvent.network_data.latency || 'N/A'} ms</div>
                                      <div><strong>VPN Detected:</strong> {selectedEvent.network_data.vpn_detected ? 'Yes' : 'No'}</div>
                                      <div><strong>Tor Detected:</strong> {selectedEvent.network_data.tor_detected ? 'Yes' : 'No'}</div>
                                      <div><strong>IP Reputation:</strong> {getIpReputationBadge(selectedEvent.network_data.ip_reputation)}</div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Device Information */}
                              <div>
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                  <FingerprintIcon className="h-4 w-4" />
                                  Device Information
                                </h4>
                                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                  <div className="space-y-2 text-sm">
                                    <div><strong>IP Address:</strong> {selectedEvent.device_info.ip_address}</div>
                                    <div><strong>Browser:</strong> {selectedEvent.device_info.browser}</div>
                                    <div><strong>OS:</strong> {selectedEvent.device_info.os}</div>
                                    <div><strong>Device Type:</strong> {selectedEvent.device_info.device_type}</div>
                                  </div>
                                  <div className="space-y-2 text-sm">
                                    <div><strong>Screen:</strong> {selectedEvent.device_info.screen_resolution}</div>
                                    <div><strong>Language:</strong> {selectedEvent.device_info.language}</div>
                                    <div><strong>Timezone:</strong> {selectedEvent.device_info.timezone}</div>
                                    <div><strong>Device Fingerprint:</strong> <code className="text-xs bg-white px-1 rounded">{selectedEvent.device_info.device_fingerprint}</code></div>
                                  </div>
                                </div>
                              </div>

                              {/* Mobile Data */}
                              {selectedEvent.mobile_data && (
                                <div>
                                  <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <Smartphone className="h-4 w-4" />
                                    Mobile Device Data
                                  </h4>
                                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                    <div className="space-y-2 text-sm">
                                      <div className="flex items-center gap-2">
                                        <strong>Battery:</strong> {selectedEvent.mobile_data.battery_level}%
                                        {getBatteryIcon(selectedEvent.mobile_data.battery_level, selectedEvent.mobile_data.battery_charging)}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <strong>Connection:</strong> {selectedEvent.mobile_data.connection_type}
                                        {getConnectionIcon(selectedEvent.mobile_data.connection_type)}
                                      </div>
                                      <div><strong>Platform:</strong> {selectedEvent.mobile_data.platform}</div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                      <div><strong>Device Memory:</strong> {selectedEvent.mobile_data.device_memory}GB</div>
                                      <div><strong>CPU Cores:</strong> {selectedEvent.mobile_data.hardware_concurrency}</div>
                                      <div><strong>Pixel Ratio:</strong> {selectedEvent.mobile_data.device_pixel_ratio}</div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Location Data */}
                              {selectedEvent.location_data && (
                                <div>
                                  <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Location Information
                                  </h4>
                                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                    <div className="space-y-2 text-sm">
                                      <div><strong>Country:</strong> {selectedEvent.location_data.country || 'Unknown'}</div>
                                      <div><strong>City:</strong> {selectedEvent.location_data.city || 'Unknown'}</div>
                                      <div><strong>Region:</strong> {selectedEvent.location_data.region || 'Unknown'}</div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                      <div><strong>Latitude:</strong> {selectedEvent.location_data.latitude || 'Unknown'}</div>
                                      <div><strong>Longitude:</strong> {selectedEvent.location_data.longitude || 'Unknown'}</div>
                                      <div><strong>Timezone Offset:</strong> {selectedEvent.location_data.timezone_offset || 'Unknown'}</div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Security Alerts */}
                              {selectedEvent.alerts.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                    Security Alerts
                                  </h4>
                                  <div className="space-y-2">
                                    {(selectedEvent.alerts || []).map((alert, index) => (
                                      <Badge key={index} className="bg-red-100 text-red-800">
                                        {alert}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No security events found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
