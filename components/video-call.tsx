"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, VideoOff, Mic, MicOff, PhoneOff } from "lucide-react"

interface VideoCallProps {
  roomName: string
  patientName: string
  onCallEnd?: () => void
  isFullscreen?: boolean
}

export function VideoCall({ roomName, patientName, onCallEnd, isFullscreen = false }: VideoCallProps) {
  const jitsiContainerRef = useRef<HTMLDivElement>(null)
  const [api, setApi] = useState<any>(null)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [isCallActive, setIsCallActive] = useState(false)

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
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: ["microphone", "camera", "hangup", "chat", "settings"],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            DEFAULT_BACKGROUND: "#2a9d8f",
          },
          userInfo: {
            displayName: `Dr. Bahir's Patient: ${patientName}`,
          },
        })

        jitsiApi.addEventListener("videoConferenceJoined", () => {
          setIsCallActive(true)
        })

        jitsiApi.addEventListener("videoConferenceLeft", () => {
          setIsCallActive(false)
          onCallEnd?.()
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
  }, [roomName, patientName, api, onCallEnd])

  const toggleVideo = () => {
    if (api) {
      api.executeCommand("toggleVideo")
      setIsVideoOn(!isVideoOn)
    }
  }

  const toggleAudio = () => {
    if (api) {
      api.executeCommand("toggleAudio")
      setIsAudioOn(!isAudioOn)
    }
  }

  const endCall = () => {
    if (api) {
      api.executeCommand("hangup")
    }
  }

  return (
    <div className={`w-full ${
      isFullscreen ? 'h-full' : 'max-w-4xl mx-auto'
    }`}>
      <Card className="w-full h-full">
        <CardHeader className="bg-gradient-to-r from-[#2a9d8f] to-[#238a7a] text-white">
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Emergency Video Consultation - {patientName}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-[calc(100%-4rem)]">
          <div className="relative w-full h-full">
            <div 
              ref={jitsiContainerRef} 
              className={`w-full bg-gray-900 rounded-b-lg ${
                isFullscreen ? 'h-full' : 'h-[32rem]'
              }`}
            />

            {/* Custom Controls Overlay */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
              <Button
                variant={isVideoOn ? "default" : "destructive"}
                size="icon"
                onClick={toggleVideo}
                className="rounded-full"
              >
                {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </Button>

              <Button
                variant={isAudioOn ? "default" : "destructive"}
                size="icon"
                onClick={toggleAudio}
                className="rounded-full"
              >
                {isAudioOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>

              <Button variant="destructive" size="icon" onClick={endCall} className="rounded-full">
                <PhoneOff className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
