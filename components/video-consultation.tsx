"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, VideoOff, Mic, MicOff, PhoneOff, Settings } from "lucide-react"
import { useLanguage } from "./language-provider"

interface VideoConsultationProps {
  roomName: string
  patientName: string
  onCallEnd?: () => void
}

export function VideoConsultation({ roomName, patientName, onCallEnd }: VideoConsultationProps) {
  const jitsiContainerRef = useRef<HTMLDivElement>(null)
  const [api, setApi] = useState<any>(null)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [isCallActive, setIsCallActive] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const { language } = useLanguage()

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isCallActive])

  useEffect(() => {
    if (jitsiContainerRef.current && !api) {
      // Load Jitsi Meet API
      const script = document.createElement("script")
      script.src = "https://meet.jit.si/external_api.js"
      script.async = true
      script.onload = () => {
        const jitsiApi = new (window as any).JitsiMeetExternalAPI("meet.jit.si", {
          roomName: roomName,
          parentNode: jitsiContainerRef.current,
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableModeratorIndicator: true,
            enableWelcomePage: false,
            prejoinPageEnabled: false,
            toolbarButtons: ["microphone", "camera", "hangup", "chat", "settings"],
            defaultLanguage: language === "ur" ? "ur" : "en",
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: ["microphone", "camera", "hangup", "chat", "settings"],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            DEFAULT_BACKGROUND: "#2a9d8f",
            BRAND_WATERMARK_LINK: "",
            SHOW_BRAND_WATERMARK: false,
          },
          userInfo: {
            displayName: `Patient: ${patientName}`,
            email: "patient@gonsteadclinic.com",
          },
        })

        jitsiApi.addEventListener("videoConferenceJoined", () => {
          setIsCallActive(true)
          console.log("Video conference joined")
        })

        jitsiApi.addEventListener("videoConferenceLeft", () => {
          setIsCallActive(false)
          onCallEnd?.()
          console.log("Video conference left")
        })

        jitsiApi.addEventListener("audioMuteStatusChanged", (event: any) => {
          setIsAudioOn(!event.muted)
        })

        jitsiApi.addEventListener("videoMuteStatusChanged", (event: any) => {
          setIsVideoOn(!event.muted)
        })

        setApi(jitsiApi)
      }
      document.head.appendChild(script)
    }

    return () => {
      if (api) {
        api.dispose()
      }
    }
  }, [roomName, patientName, api, onCallEnd, language])

  const toggleVideo = () => {
    if (api) {
      api.executeCommand("toggleVideo")
    }
  }

  const toggleAudio = () => {
    if (api) {
      api.executeCommand("toggleAudio")
    }
  }

  const endCall = () => {
    if (api) {
      api.executeCommand("hangup")
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-2xl border-2 border-[#2a9d8f]">
      <CardHeader className="bg-gradient-to-r from-[#2a9d8f] to-[#238a7a] text-white p-6">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Video className="h-6 w-6" />
            <div>
              <div className="text-xl font-bold">
                {language === "ur" ? "ایمرجنسی ویڈیو مشاورت" : "Emergency Video Consultation"}
              </div>
              <div className="text-sm opacity-90">
                {language === "ur" ? `مریض: ${patientName}` : `Patient: ${patientName}`}
              </div>
            </div>
          </div>
          {isCallActive && (
            <div className="text-right">
              <div className="text-lg font-mono">{formatDuration(callDuration)}</div>
              <div className="text-xs opacity-90">{language === "ur" ? "کال کا وقت" : "Call Duration"}</div>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative bg-gray-900">
          <div ref={jitsiContainerRef} className="w-full h-[500px] bg-gray-900" />

          {/* Custom Controls Overlay */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 bg-black/50 backdrop-blur-sm rounded-full p-3">
            <Button
              variant={isVideoOn ? "default" : "destructive"}
              size="icon"
              onClick={toggleVideo}
              className="rounded-full h-12 w-12 bg-white/20 hover:bg-white/30 border-2 border-white/50"
            >
              {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>

            <Button
              variant={isAudioOn ? "default" : "destructive"}
              size="icon"
              onClick={toggleAudio}
              className="rounded-full h-12 w-12 bg-white/20 hover:bg-white/30 border-2 border-white/50"
            >
              {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>

            <Button
              variant="destructive"
              size="icon"
              onClick={endCall}
              className="rounded-full h-12 w-12 bg-red-500 hover:bg-red-600 border-2 border-white/50"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-12 w-12 bg-white/20 hover:bg-white/30 border-2 border-white/50"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>

          {/* Call Status Indicator */}
          {!isCallActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
              <div className="text-center text-white">
                <div className="animate-pulse mb-4">
                  <Video className="h-16 w-16 mx-auto text-[#2a9d8f]" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {language === "ur" ? "کال کا انتظار..." : "Waiting for call..."}
                </h3>
                <p className="text-gray-300">
                  {language === "ur" ? "ڈاکٹر باہر جلد ہی آپ سے جڑیں گے" : "Dr. Bahir will join you shortly"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Call Information */}
        <div className="p-6 bg-gradient-to-r from-[#f4f1de] to-white dark:from-gray-800 dark:to-gray-900">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="text-2xl font-bold text-[#2a9d8f]">15</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === "ur" ? "منٹ کی حد" : "Minute Limit"}
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="text-2xl font-bold text-[#2a9d8f]">HD</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === "ur" ? "ویڈیو کوالٹی" : "Video Quality"}
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="text-2xl font-bold text-[#2a9d8f]">🔒</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === "ur" ? "محفوظ کنکشن" : "Secure Connection"}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
