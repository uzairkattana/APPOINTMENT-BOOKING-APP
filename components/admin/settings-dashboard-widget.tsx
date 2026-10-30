"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { 
  Settings, 
  Bell, 
  BellRing, 
  BellOff, 
  ExternalLink,
  Clock,
  Volume2,
  VolumeX,
  Target,
  Shield,
  Zap,
  ArrowRight
} from "lucide-react"
import { useNotificationSettings } from "../../lib/settings-context"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

export function SettingsDashboardWidget() {
  const { notifications, updateNotification } = useNotificationSettings()
  const { toast } = useToast()
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleNotifications = (enabled: boolean) => {
    updateNotification('enabled', enabled)
    toast({
      title: enabled ? "🔔 Notifications Enabled" : "🔕 Notifications Disabled",
      description: enabled ? "Doctor notifications are now active" : "Doctor notifications are now disabled",
      className: enabled ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
    })
  }

  const toggleSound = (enabled: boolean) => {
    updateNotification('sound', enabled)
    toast({
      title: enabled ? "🔊 Sound Enabled" : "🔇 Sound Disabled",
      description: `Notification sounds are now ${enabled ? 'on' : 'off'}`,
      className: "border-blue-500 bg-blue-50"
    })
  }

  return (
    <Card className="border-blue-200 bg-blue-50/30 hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Quick Settings</h3>
              <p className="text-sm text-gray-600">System controls</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:bg-blue-100"
          >
            {isExpanded ? "Less" : "More"}
            <ArrowRight className={`h-4 w-4 ml-1 transition-transform duration-200 ${
              isExpanded ? "rotate-90" : ""
            }`} />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Controls */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2">
              {notifications.enabled ? (
                <BellRing className="h-4 w-4 text-green-600" />
              ) : (
                <BellOff className="h-4 w-4 text-red-600" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">Notifications</p>
                <p className="text-xs text-gray-600">{notifications.enabled ? "Active" : "Disabled"}</p>
              </div>
            </div>
            <Switch
              checked={notifications.enabled}
              onCheckedChange={toggleNotifications}
              className="scale-75"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2">
              {notifications.sound ? (
                <Volume2 className="h-4 w-4 text-blue-600" />
              ) : (
                <VolumeX className="h-4 w-4 text-gray-600" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">Sound</p>
                <p className="text-xs text-gray-600">{notifications.sound ? "On" : "Off"}</p>
              </div>
            </div>
            <Switch
              checked={notifications.sound}
              onCheckedChange={toggleSound}
              disabled={!notifications.enabled}
              className="scale-75"
            />
          </div>
        </div>

        {/* Status Display */}
        <div className="bg-white rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900">Current Settings</span>
            <Badge variant="outline" className="text-xs">
              Duration: {notifications.duration}s
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
            <div className="text-center">
              <Clock className="h-3 w-3 mx-auto mb-1" />
              <div>Max: {notifications.maxVisible}</div>
            </div>
            <div className="text-center">
              <Bell className="h-3 w-3 mx-auto mb-1" />
              <div>{notifications.position.replace('-', ' ')}</div>
            </div>
            <div className="text-center">
              <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${
                notifications.emergencyNotifications.enabled ? 'bg-red-500' : 'bg-gray-300'
              }`} />
              <div>Emergency</div>
            </div>
          </div>
        </div>

        {/* Expanded Controls */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 border border-indigo-200 text-center">
                  <Target className="h-5 w-5 text-indigo-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">System Limits</p>
                  <p className="text-xs text-gray-600">Manage quotas</p>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-red-200 text-center">
                  <Shield className="h-5 w-5 text-red-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Security</p>
                  <p className="text-xs text-gray-600">Access control</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Integrations</p>
                      <p className="text-xs text-gray-600">External services</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Coming Soon
                  </Badge>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link href="/admin/settings" className="flex-1">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">System Status</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-600 font-medium">All Systems Operational</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Mini Settings Widget (even smaller version)
export function MiniSettingsWidget() {
  const { notifications, updateNotification } = useNotificationSettings()
  
  return (
    <Card className="border-blue-200 bg-blue-50/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Settings className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">Settings</span>
          </div>
          <Link href="/admin/settings">
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <ExternalLink className="h-3 w-3" />
            </Button>
          </Link>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Notifications</span>
            <Switch
              checked={notifications.enabled}
              onCheckedChange={(enabled) => updateNotification('enabled', enabled)}
              className="scale-75"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Sound</span>
            <Switch
              checked={notifications.sound}
              onCheckedChange={(enabled) => updateNotification('sound', enabled)}
              disabled={!notifications.enabled}
              className="scale-75"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
