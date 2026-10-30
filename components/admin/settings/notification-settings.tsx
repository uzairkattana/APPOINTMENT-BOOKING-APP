"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Bell, Mail, MessageSquare, AlertTriangle, Volume2, VolumeX } from "lucide-react"
import { motion } from "framer-motion"

interface NotificationSettingsProps {
  settings: {
    enabled: boolean
    emailNotifications: boolean
    smsNotifications: boolean
    appointmentReminders: boolean
    emergencyAlerts: boolean
    dailyReports: boolean
    position: "top-right" | "top-left" | "bottom-right" | "bottom-left"
    duration: number
    maxVisible: number
    sound: boolean
    vibration: boolean
  }
  onUpdate: (path: string, value: any) => void
}

export function NotificationSettings({ settings, onUpdate }: NotificationSettingsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Master Control */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-blue-900">
            <Bell className="h-5 w-5" />
            <span>Master Notification Control</span>
            <Badge variant={settings.enabled ? "default" : "secondary"} className="ml-auto">
              {settings.enabled ? "Enabled" : "Disabled"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium text-gray-900">
                Enable All Notifications
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Master switch to enable/disable all notification functionality
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) => onUpdate("enabled", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card className="border-green-200 bg-green-50/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-green-900">
            <Mail className="h-5 w-5" />
            <span>Notification Types</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "emailNotifications", label: "Email Notifications", icon: Mail, desc: "Receive notifications via email" },
            { key: "smsNotifications", label: "SMS Notifications", icon: MessageSquare, desc: "Receive notifications via SMS" },
            { key: "appointmentReminders", label: "Appointment Reminders", icon: Bell, desc: "Send reminders to patients" },
            { key: "emergencyAlerts", label: "Emergency Alerts", icon: AlertTriangle, desc: "High-priority emergency notifications" },
            { key: "dailyReports", label: "Daily Reports", icon: Mail, desc: "Daily summary reports" }
          ].map((item) => {
            const IconComponent = item.icon
            return (
              <div key={item.key} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <IconComponent className="h-4 w-4 text-gray-400" />
                  <div>
                    <Label className="font-medium text-gray-900">{item.label}</Label>
                    <p className="text-xs text-gray-600">{item.desc}</p>
                  </div>
                </div>
                <Switch
                  checked={settings[item.key as keyof typeof settings] as boolean}
                  onCheckedChange={(checked) => onUpdate(item.key, checked)}
                  disabled={!settings.enabled}
                />
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card className="border-purple-200 bg-purple-50/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-purple-900">
            <Bell className="h-5 w-5" />
            <span>Display & Behavior</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="font-medium text-gray-900">Notification Position</Label>
            <Select value={settings.position} onValueChange={(value) => onUpdate("position", value)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="font-medium text-gray-900">Display Duration</Label>
            <div className="mt-3 space-y-3">
              <Slider
                value={[settings.duration]}
                onValueChange={([value]) => onUpdate("duration", value)}
                min={1}
                max={30}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1s</span>
                <span className="font-medium text-purple-600">{settings.duration}s</span>
                <span>30s</span>
              </div>
            </div>
          </div>

          <div>
            <Label className="font-medium text-gray-900">Maximum Visible</Label>
            <Select value={settings.maxVisible.toString()} onValueChange={(value) => onUpdate("maxVisible", parseInt(value))}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 notification</SelectItem>
                <SelectItem value="2">2 notifications</SelectItem>
                <SelectItem value="3">3 notifications</SelectItem>
                <SelectItem value="4">4 notifications</SelectItem>
                <SelectItem value="5">5 notifications</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2">
                {settings.sound ? (
                  <Volume2 className="h-4 w-4 text-green-600" />
                ) : (
                  <VolumeX className="h-4 w-4 text-gray-400" />
                )}
                <Label className="text-sm">Sound</Label>
              </div>
              <Switch
                checked={settings.sound}
                onCheckedChange={(checked) => onUpdate("sound", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-blue-600" />
                <Label className="text-sm">Vibration</Label>
              </div>
              <Switch
                checked={settings.vibration}
                onCheckedChange={(checked) => onUpdate("vibration", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="border-orange-200 bg-orange-50/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-orange-900">
            <Bell className="h-5 w-5" />
            <span>Settings Summary</span>
            <Badge variant="outline" className="ml-auto">Preview</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-4 rounded-lg border border-orange-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Current Configuration</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p><strong>Master Status:</strong> {settings.enabled ? "✅ Enabled" : "❌ Disabled"}</p>
                <p><strong>Email:</strong> {settings.emailNotifications ? "✅" : "❌"}</p>
                <p><strong>SMS:</strong> {settings.smsNotifications ? "✅" : "❌"}</p>
                <p><strong>Reminders:</strong> {settings.appointmentReminders ? "✅" : "❌"}</p>
              </div>
              <div className="space-y-2">
                <p><strong>Position:</strong> {settings.position}</p>
                <p><strong>Duration:</strong> {settings.duration}s</p>
                <p><strong>Max Visible:</strong> {settings.maxVisible}</p>
                <p><strong>Sound:</strong> {settings.sound ? "✅" : "❌"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
