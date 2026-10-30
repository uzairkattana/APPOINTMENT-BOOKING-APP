"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Clock, Calendar, AlertTriangle, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

interface OperatingHoursSettingsProps {
  settings: {
    [key: string]: { open: string; close: string; closed: boolean }
    emergency: { available: boolean; note: string }
  }
  onUpdate: (path: string, value: any) => void
}

export function OperatingHoursSettings({ settings, onUpdate }: OperatingHoursSettingsProps) {
  const daysOfWeek = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" }
  ]

  const updateDaySettings = (day: string, field: string, value: string | boolean) => {
    onUpdate(`${day}.${field}`, value)
  }

  const getCurrentDay = () => {
    const today = new Date().getDay()
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return days[today]
  }

  const isCurrentlyOpen = () => {
    const currentDay = getCurrentDay()
    const currentTime = new Date()
    const currentHour = currentTime.getHours()
    const currentMinute = currentTime.getMinutes()
    const currentTimeInMinutes = currentHour * 60 + currentMinute

    if (!settings[currentDay] || settings[currentDay].closed) {
      return false
    }

    const openTime = settings[currentDay].open.split(':')
    const closeTime = settings[currentDay].close.split(':')
    const openInMinutes = parseInt(openTime[0]) * 60 + parseInt(openTime[1])
    const closeInMinutes = parseInt(closeTime[0]) * 60 + parseInt(closeTime[1])

    return currentTimeInMinutes >= openInMinutes && currentTimeInMinutes <= closeInMinutes
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Current Status */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-blue-900">
            <Clock className="h-5 w-5" />
            <span>Current Status</span>
            <Badge variant={isCurrentlyOpen() ? "default" : "secondary"} className="ml-auto">
              {isCurrentlyOpen() ? "Open Now" : "Closed"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                {isCurrentlyOpen() ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                )}
                <span className="font-medium">
                  {isCurrentlyOpen() ? "Currently Open" : "Currently Closed"}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Today is {getCurrentDay().charAt(0).toUpperCase() + getCurrentDay().slice(1)}
              </p>
              {settings[getCurrentDay()] && !settings[getCurrentDay()].closed && (
                <p className="text-sm text-gray-600">
                  Hours: {settings[getCurrentDay()].open} - {settings[getCurrentDay()].close}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Emergency Services</span>
              </div>
              <p className="text-sm text-gray-600">
                {settings.emergency?.available ? "Available 24/7" : "Not Available"}
              </p>
              {settings.emergency?.note && (
                <p className="text-xs text-gray-500">
                  {settings.emergency.note}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule */}
      <Card className="border-green-200 bg-green-50/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-green-900">
            <Calendar className="h-5 w-5" />
            <span>Weekly Operating Schedule</span>
            <Badge variant="secondary" className="ml-auto">Regular Hours</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {daysOfWeek.map((day) => {
            const daySettings = settings[day.key] || { open: "09:00", close: "18:00", closed: false }
            const isToday = getCurrentDay() === day.key
            
            return (
              <motion.div
                key={day.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: daysOfWeek.indexOf(day) * 0.1 }}
                className={`p-4 rounded-lg border ${
                  isToday 
                    ? 'border-green-300 bg-green-100/50' 
                    : 'border-green-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="min-w-[80px]">
                      <span className={`font-medium ${isToday ? 'text-green-800' : 'text-gray-900'}`}>
                        {day.label}
                      </span>
                      {isToday && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Today
                        </Badge>
                      )}
                    </div>
                    
                    <Switch
                      checked={!daySettings.closed}
                      onCheckedChange={(checked) => updateDaySettings(day.key, "closed", !checked)}
                    />
                    
                    {!daySettings.closed && (
                      <div className="flex items-center space-x-2">
                        <Input
                          type="time"
                          value={daySettings.open}
                          onChange={(e) => updateDaySettings(day.key, "open", e.target.value)}
                          className="w-32"
                        />
                        <span className="text-gray-500">to</span>
                        <Input
                          type="time"
                          value={daySettings.close}
                          onChange={(e) => updateDaySettings(day.key, "close", e.target.value)}
                          className="w-32"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    {daySettings.closed ? (
                      <Badge variant="outline" className="text-gray-500">
                        Closed
                      </Badge>
                    ) : (
                      <div className="text-sm text-gray-600">
                        {daySettings.open} - {daySettings.close}
                        <div className="text-xs text-gray-500">
                          {(() => {
                            const openTime = daySettings.open.split(':')
                            const closeTime = daySettings.close.split(':')
                            const openInMinutes = parseInt(openTime[0]) * 60 + parseInt(openTime[1])
                            const closeInMinutes = parseInt(closeTime[0]) * 60 + parseInt(closeTime[1])
                            const durationInMinutes = closeInMinutes - openInMinutes
                            const hours = Math.floor(durationInMinutes / 60)
                            const minutes = durationInMinutes % 60
                            return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </CardContent>
      </Card>

      {/* Emergency Services */}
      <Card className="border-red-200 bg-red-50/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-red-900">
            <AlertTriangle className="h-5 w-5" />
            <span>Emergency & After-Hours Services</span>
            <Badge variant={settings.emergency?.available ? "default" : "outline"} className="ml-auto">
              {settings.emergency?.available ? "Available" : "Unavailable"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium text-gray-900">
                24/7 Emergency Services
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Enable emergency consultations outside regular hours
              </p>
            </div>
            <Switch
              checked={settings.emergency?.available || false}
              onCheckedChange={(checked) => onUpdate("emergency.available", checked)}
            />
          </div>

          <div>
            <Label htmlFor="emergencyNote" className="font-medium text-gray-900">
              Emergency Services Note
            </Label>
            <Textarea
              id="emergencyNote"
              value={settings.emergency?.note || ""}
              onChange={(e) => onUpdate("emergency.note", e.target.value)}
              placeholder="Additional information about emergency services (e.g., contact number, conditions, etc.)"
              className="mt-2 min-h-[80px]"
            />
            <p className="text-xs text-gray-600 mt-1">
              This note will be displayed to patients when they try to book emergency appointments
            </p>
          </div>

          {settings.emergency?.available && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-white p-4 rounded-lg border border-red-200"
            >
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Emergency Service Features</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• 24/7 appointment booking availability</li>
                <li>• Priority scheduling for urgent cases</li>
                <li>• Automated emergency notifications</li>
                <li>• After-hours contact information display</li>
                <li>• Emergency appointment confirmation system</li>
              </ul>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Summary */}
      <Card className="border-purple-200 bg-purple-50/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-purple-900">
            <Clock className="h-5 w-5" />
            <span>Schedule Summary</span>
            <Badge variant="outline" className="ml-auto">Overview</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">Weekly Hours</h4>
              <div className="space-y-2">
                {daysOfWeek.map((day) => {
                  const daySettings = settings[day.key] || { open: "09:00", close: "18:00", closed: false }
                  return (
                    <div key={day.key} className="flex justify-between text-sm">
                      <span className="text-gray-600">{day.label}:</span>
                      <span className="text-gray-900">
                        {daySettings.closed ? "Closed" : `${daySettings.open} - ${daySettings.close}`}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">Quick Stats</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Open Days:</span>
                  <span className="text-gray-900">
                    {daysOfWeek.filter(day => !settings[day.key]?.closed).length} / 7
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Weekly Hours:</span>
                  <span className="text-gray-900">
                    {(() => {
                      let totalMinutes = 0
                      daysOfWeek.forEach(day => {
                        const daySettings = settings[day.key]
                        if (daySettings && !daySettings.closed) {
                          const openTime = daySettings.open.split(':')
                          const closeTime = daySettings.close.split(':')
                          const openInMinutes = parseInt(openTime[0]) * 60 + parseInt(openTime[1])
                          const closeInMinutes = parseInt(closeTime[0]) * 60 + parseInt(closeTime[1])
                          totalMinutes += closeInMinutes - openInMinutes
                        }
                      })
                      return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
                    })()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Emergency Services:</span>
                  <span className="text-gray-900">
                    {settings.emergency?.available ? "Available" : "Not Available"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
