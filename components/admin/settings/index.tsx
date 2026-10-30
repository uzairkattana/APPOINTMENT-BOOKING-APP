"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

// Placeholder components for remaining settings sections

export function UserInterfaceSettings({ settings, onUpdate }: { settings: any; onUpdate: (path: string, value: any) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="border-pink-200 bg-pink-50/30">
        <CardHeader>
          <CardTitle className="text-pink-900">User Interface Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Theme, colors, language, and accessibility settings will be configured here.</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function SecuritySettings({ settings, onUpdate }: { settings: any; onUpdate: (path: string, value: any) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="border-red-200 bg-red-50/30">
        <CardHeader>
          <CardTitle className="text-red-900">Security Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Password policies, session management, and security configurations will be managed here.</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function SystemLimitsSettings({ settings, onUpdate }: { settings: any; onUpdate: (path: string, value: any) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="border-indigo-200 bg-indigo-50/30">
        <CardHeader>
          <CardTitle className="text-indigo-900">System Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Appointment limits, pagination settings, and system constraints will be configured here.</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function IntegrationSettings({ settings, onUpdate }: { settings: any; onUpdate: (path: string, value: any) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="border-yellow-200 bg-yellow-50/30">
        <CardHeader>
          <CardTitle className="text-yellow-900">Integration Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">WhatsApp, SMS, email, calendar, and voice service integrations will be managed here.</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function AdvancedSettings({ settings, onUpdate }: { settings: any; onUpdate: (path: string, value: any) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="border-gray-200 bg-gray-50/30">
        <CardHeader>
          <CardTitle className="text-gray-900">Advanced Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Backup configuration, maintenance settings, and advanced system options will be available here.</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
