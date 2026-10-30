"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Play,
  Square,
  TestTube,
  Settings,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { 
  professionalVoiceNotification, 
  type VoiceNotificationSettings,
  type VoiceProfile 
} from "@/lib/professional-voice-notification"
import { useToast } from "@/hooks/use-toast"

export function VoiceNotificationControls() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<VoiceNotificationSettings>(
    professionalVoiceNotification.getSettings()
  )
  const [voiceProfiles] = useState<VoiceProfile[]>(
    professionalVoiceNotification.getVoiceProfiles()
  )
  const [isPlaying, setIsPlaying] = useState(false)
  const [queueLength, setQueueLength] = useState(0)

  // Load settings on mount
  useEffect(() => {
    professionalVoiceNotification.loadSettings()
    const loadedSettings = professionalVoiceNotification.getSettings()
    setSettings(loadedSettings)

    // Update queue length periodically
    const interval = setInterval(() => {
      setQueueLength(professionalVoiceNotification.getQueueLength())
      setIsPlaying(professionalVoiceNotification.isCurrentlyPlaying())
    }, 500)

    return () => clearInterval(interval)
  }, [])

  const handleSettingChange = (key: keyof VoiceNotificationSettings, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    professionalVoiceNotification.updateSettings({ [key]: value })

    toast({
      title: "✅ Voice Settings Updated",
      description: `${key.charAt(0).toUpperCase() + key.slice(1)} has been updated`,
      className: "border-green-500 bg-green-50"
    })
  }

  const handlePriorityChange = (priority: keyof VoiceNotificationSettings['priorities'], value: boolean) => {
    const newPriorities = { ...settings.priorities, [priority]: value }
    const newSettings = { ...settings, priorities: newPriorities }
    setSettings(newSettings)
    professionalVoiceNotification.updateSettings({ priorities: newPriorities })

    toast({
      title: "🔔 Priority Settings Updated",
      description: `${priority.charAt(0).toUpperCase() + priority.slice(1)} notifications ${value ? 'enabled' : 'disabled'}`,
      className: "border-blue-500 bg-blue-50"
    })
  }

  const testVoice = async (profileId?: string) => {
    setIsPlaying(true)
    
    const success = await professionalVoiceNotification.testVoice(profileId)
    
    if (success) {
      toast({
        title: "🎤 Voice Test",
        description: "Playing test notification...",
        className: "border-purple-500 bg-purple-50"
      })
    } else {
      toast({
        title: "❌ Voice Test Failed",
        description: "Could not play voice notification. Check browser permissions.",
        className: "border-red-500 bg-red-50"
      })
    }

    setTimeout(() => {
      setIsPlaying(professionalVoiceNotification.isCurrentlyPlaying())
    }, 1000)
  }

  const stopVoice = () => {
    professionalVoiceNotification.stop()
    professionalVoiceNotification.clearQueue()
    setIsPlaying(false)
    setQueueLength(0)

    toast({
      title: "⏹️ Voice Stopped",
      description: "All voice notifications stopped and queue cleared",
      className: "border-gray-500 bg-gray-50"
    })
  }

  return (
    <Card className="w-full max-w-2xl border-2 border-blue-200">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-blue-600" />
              Professional Voice Notifications
            </CardTitle>
            <CardDescription>
              Unique, soft, and professional voice for medical notifications
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isPlaying && (
              <Badge variant="default" className="animate-pulse bg-green-500">
                <Play className="h-3 w-3 mr-1" />
                Speaking
              </Badge>
            )}
            {queueLength > 0 && (
              <Badge variant="secondary">
                {queueLength} queued
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Master Toggle */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-3">
            {settings.enabled ? (
              <Volume2 className="h-5 w-5 text-blue-600" />
            ) : (
              <VolumeX className="h-5 w-5 text-gray-400" />
            )}
            <div>
              <Label className="text-base font-semibold">
                Enable Voice Notifications
              </Label>
              <p className="text-sm text-gray-600">
                Speak notifications with professional voice
              </p>
            </div>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(checked) => handleSettingChange('enabled', checked)}
          />
        </div>

        {settings.enabled && (
          <>
            {/* Voice Profile Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Voice Profile</Label>
              <div className="grid grid-cols-1 gap-2">
                {voiceProfiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => handleSettingChange('selectedVoice', profile.id)}
                    className={`
                      flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left
                      ${
                        settings.selectedVoice === profile.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className={`mt-1 ${
                      settings.selectedVoice === profile.id ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      {settings.selectedVoice === profile.id ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <AlertCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{profile.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {profile.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{profile.description}</p>
                    </div>
                    {settings.selectedVoice === profile.id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          testVoice(profile.id)
                        }}
                        className="ml-2"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Volume Control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Volume</Label>
                <Badge variant="secondary">{Math.round(settings.volume * 100)}%</Badge>
              </div>
              <Slider
                value={[settings.volume]}
                onValueChange={([value]) => handleSettingChange('volume', value)}
                min={0}
                max={1}
                step={0.05}
                className="w-full"
              />
            </div>

            {/* Speed Control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Speech Rate</Label>
                <Badge variant="secondary">{settings.rate.toFixed(2)}x</Badge>
              </div>
              <Slider
                value={[settings.rate]}
                onValueChange={([value]) => handleSettingChange('rate', value)}
                min={0.5}
                max={1.5}
                step={0.05}
                className="w-full"
              />
              <p className="text-xs text-gray-600">
                Slower rates are better for clarity, faster for efficiency
              </p>
            </div>

            {/* Pitch Control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Voice Pitch</Label>
                <Badge variant="secondary">{settings.pitch.toFixed(2)}</Badge>
              </div>
              <Slider
                value={[settings.pitch]}
                onValueChange={([value]) => handleSettingChange('pitch', value)}
                min={0.5}
                max={1.5}
                step={0.05}
                className="w-full"
              />
            </div>

            <Separator />

            {/* Priority Settings */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Speak Notifications By Priority</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">Emergency</span>
                  </div>
                  <Switch
                    checked={settings.priorities.emergency}
                    onCheckedChange={(checked) => handlePriorityChange('emergency', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium">Urgent</span>
                  </div>
                  <Switch
                    checked={settings.priorities.urgent}
                    onCheckedChange={(checked) => handlePriorityChange('urgent', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Normal</span>
                  </div>
                  <Switch
                    checked={settings.priorities.normal}
                    onCheckedChange={(checked) => handlePriorityChange('normal', checked)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Test & Control Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={() => testVoice()}
                disabled={isPlaying}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Test Voice
              </Button>

              <Button
                onClick={stopVoice}
                disabled={!isPlaying && queueLength === 0}
                variant="destructive"
                className="px-6"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </div>
          </>
        )}

        {/* Status Info */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-2">
            <Settings className="h-4 w-4 text-gray-600 mt-0.5" />
            <div className="text-xs text-gray-600">
              <p className="font-medium mb-1">Voice notifications use browser's built-in TTS engine</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Best quality voices: Google Chrome, Microsoft Edge, Safari</li>
                <li>Emergency notifications automatically use urgent voice</li>
                <li>Settings are saved automatically in your browser</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

