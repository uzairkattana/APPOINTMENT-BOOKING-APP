"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Settings,
  User,
  UserCheck,
  Mic,
  Speaker
} from 'lucide-react'
import { voiceService, type VoiceSettings } from '@/lib/voice-service'
import { useToast } from '@/hooks/use-toast'

interface VoiceSettingsProps {
  userType: 'patient' | 'doctor'
  className?: string
  onSettingsChange?: (settings: VoiceSettings) => void
}

export default function VoiceSettingsComponent({ 
  userType, 
  className = "",
  onSettingsChange 
}: VoiceSettingsProps) {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    stability: 0.5,
    similarity_boost: 0.8,
    style: 0.2,
    use_speaker_boost: true
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const { toast } = useToast()

  // Sample text for voice testing
  const testTexts = {
    patient: "Hello! I'm here to help you with your medical questions and appointment booking. How are you feeling today?",
    doctor: "Good day! This is Dr. Bashir Khan from Gonstead Chiropractic Clinic. I'm ready to assist you with your healthcare needs."
  }

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem(`voice-settings-${userType}`)
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setVoiceSettings(parsed)
        voiceService.updateVoiceSettings(parsed)
      } catch (error) {
        console.error('Error loading voice settings:', error)
      }
    }

    const savedVoiceEnabled = localStorage.getItem(`voice-enabled-${userType}`)
    if (savedVoiceEnabled) {
      setIsVoiceEnabled(savedVoiceEnabled === 'true')
    }
  }, [userType])

  const handleSettingChange = (key: keyof VoiceSettings, value: number | boolean) => {
    const newSettings = { ...voiceSettings, [key]: value }
    setVoiceSettings(newSettings)
    voiceService.updateVoiceSettings(newSettings)
    
    // Save to localStorage
    localStorage.setItem(`voice-settings-${userType}`, JSON.stringify(newSettings))
    
    if (onSettingsChange) {
      onSettingsChange(newSettings)
    }
  }

  const handleVoiceToggle = (enabled: boolean) => {
    setIsVoiceEnabled(enabled)
    localStorage.setItem(`voice-enabled-${userType}`, enabled.toString())
    
    toast({
      title: enabled ? "Voice Enabled" : "Voice Disabled",
      description: enabled 
        ? `Voice responses are now active for ${userType} interactions`
        : "Voice responses have been turned off",
    })
  }

  const testVoice = async () => {
    if (isTesting) return
    
    setIsTesting(true)
    setIsPlaying(true)
    
    try {
      const success = await voiceService.speak(testTexts[userType], userType)
      
      if (!success) {
        toast({
          title: "Voice Test Failed",
          description: "Could not play voice sample. Please check your settings.",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Voice Test Complete",
          description: "Voice sample played successfully!",
        })
      }
    } catch (error) {
      console.error('Voice test error:', error)
      toast({
        title: "Voice Test Error",
        description: "An error occurred while testing voice.",
        variant: "destructive"
      })
    } finally {
      setIsTesting(false)
      setIsPlaying(false)
    }
  }

  const stopVoice = () => {
    voiceService.stopCurrentAudio()
    setIsPlaying(false)
    setIsTesting(false)
  }

  const resetToDefaults = () => {
    const defaultSettings: VoiceSettings = {
      stability: 0.5,
      similarity_boost: 0.8,
      style: 0.2,
      use_speaker_boost: true
    }
    
    setVoiceSettings(defaultSettings)
    voiceService.updateVoiceSettings(defaultSettings)
    localStorage.setItem(`voice-settings-${userType}`, JSON.stringify(defaultSettings))
    
    if (onSettingsChange) {
      onSettingsChange(defaultSettings)
    }
    
    toast({
      title: "Settings Reset",
      description: "Voice settings have been reset to defaults.",
    })
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {userType === 'doctor' ? (
              <UserCheck className="h-5 w-5 text-blue-600" />
            ) : (
              <User className="h-5 w-5 text-green-600" />
            )}
            <div>
              <CardTitle className="text-lg">
                Voice Settings ({userType === 'doctor' ? 'Doctor' : 'Patient'})
              </CardTitle>
              <CardDescription>
                Configure voice responses for {userType} interactions
              </CardDescription>
            </div>
          </div>
          <Badge variant={userType === 'doctor' ? 'default' : 'secondary'}>
            {userType.charAt(0).toUpperCase() + userType.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Enable/Disable Voice */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isVoiceEnabled ? (
              <Volume2 className="h-5 w-5 text-green-600" />
            ) : (
              <VolumeX className="h-5 w-5 text-gray-400" />
            )}
            <div>
              <p className="font-medium">Enable Voice Responses</p>
              <p className="text-sm text-muted-foreground">
                Turn on/off voice responses for this user type
              </p>
            </div>
          </div>
          <Switch
            checked={isVoiceEnabled}
            onCheckedChange={handleVoiceToggle}
          />
        </div>

        <Separator />

        {/* Voice Test */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Speaker className="h-4 w-4" />
            <p className="font-medium">Voice Test</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={testVoice}
              disabled={!isVoiceEnabled || isTesting}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {isTesting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  Testing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Test Voice
                </>
              )}
            </Button>
            {isPlaying && (
              <Button
                onClick={stopVoice}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-red-600"
              >
                <Pause className="h-4 w-4" />
                Stop
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Test message: "{testTexts[userType].substring(0, 50)}..."
          </p>
        </div>

        <Separator />

        {/* Voice Quality Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <p className="font-medium">Voice Quality Settings</p>
          </div>

          {/* Stability */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Stability</label>
              <span className="text-sm text-muted-foreground">
                {(voiceSettings.stability * 100).toFixed(0)}%
              </span>
            </div>
            <Slider
              value={[voiceSettings.stability]}
              onValueChange={([value]) => handleSettingChange('stability', value)}
              max={1}
              min={0}
              step={0.1}
              disabled={!isVoiceEnabled}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Lower values = more variable speech, Higher values = more consistent speech
            </p>
          </div>

          {/* Similarity Boost */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Similarity Boost</label>
              <span className="text-sm text-muted-foreground">
                {(voiceSettings.similarity_boost * 100).toFixed(0)}%
              </span>
            </div>
            <Slider
              value={[voiceSettings.similarity_boost]}
              onValueChange={([value]) => handleSettingChange('similarity_boost', value)}
              max={1}
              min={0}
              step={0.1}
              disabled={!isVoiceEnabled}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Higher values = more similar to original voice training
            </p>
          </div>

          {/* Style */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Style</label>
              <span className="text-sm text-muted-foreground">
                {(voiceSettings.style || 0 * 100).toFixed(0)}%
              </span>
            </div>
            <Slider
              value={[voiceSettings.style || 0]}
              onValueChange={([value]) => handleSettingChange('style', value)}
              max={1}
              min={0}
              step={0.1}
              disabled={!isVoiceEnabled}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Higher values = more stylistic expression in speech
            </p>
          </div>

          {/* Speaker Boost */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Speaker Boost</p>
              <p className="text-xs text-muted-foreground">
                Enhance clarity for speakers
              </p>
            </div>
            <Switch
              checked={voiceSettings.use_speaker_boost || false}
              onCheckedChange={(value) => handleSettingChange('use_speaker_boost', value)}
              disabled={!isVoiceEnabled}
            />
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={resetToDefaults}
            variant="outline"
            size="sm"
            disabled={!isVoiceEnabled}
          >
            Reset to Defaults
          </Button>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Voice Status:</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              isVoiceEnabled ? 'bg-green-500' : 'bg-gray-400'
            }`} />
            <span className={isVoiceEnabled ? 'text-green-600' : 'text-gray-500'}>
              {isVoiceEnabled ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
