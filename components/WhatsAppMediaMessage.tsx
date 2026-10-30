"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Download, Eye, File, Image as ImageIcon, Video, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/hooks/use-toast'

interface MediaMessageProps {
  message: {
    id: string
    type: 'voice' | 'video' | 'image' | 'file'
    url: string
    duration?: number
    size?: number
    name?: string
    mimeType?: string
    sender_id: string
    created_at: string
    isOwn: boolean
    adminMode?: boolean
  }
  onDownload?: (media: any) => void
}

export default function WhatsAppMediaMessage({ 
  message, 
  onDownload, 
  adminMode = false 
}: MediaMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [isLoaded, setIsLoaded] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement | null>(null)
  
  const { toast } = useToast()

  // Initialize media element
  useEffect(() => {
    const mediaElement = message.type === 'video' ? videoRef.current : audioRef.current
    mediaRef.current = mediaElement
    
    if (!mediaElement) return

    const handleLoadedMetadata = () => {
      setDuration(mediaElement.duration)
      setIsLoaded(true)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(mediaElement.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    const handleVolumeChange = () => {
      setVolume(mediaElement.volume)
      setIsMuted(mediaElement.muted)
    }

    mediaElement.addEventListener('loadedmetadata', handleLoadedMetadata)
    mediaElement.addEventListener('timeupdate', handleTimeUpdate)
    mediaElement.addEventListener('ended', handleEnded)
    mediaElement.addEventListener('volumechange', handleVolumeChange)

    return () => {
      mediaElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
      mediaElement.removeEventListener('timeupdate', handleTimeUpdate)
      mediaElement.removeEventListener('ended', handleEnded)
      mediaElement.removeEventListener('volumechange', handleVolumeChange)
    }
  }, [message.type])

  // Play/pause functionality
  const togglePlayPause = () => {
    if (!mediaRef.current || !isLoaded) return

    if (isPlaying) {
      mediaRef.current.pause()
    } else {
      mediaRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  // Seek functionality
  const handleSeek = (value: number[]) => {
    if (!mediaRef.current) return
    const newTime = value[0]
    mediaRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  // Volume control
  const handleVolumeChange = (value: number[]) => {
    if (!mediaRef.current) return
    const newVolume = value[0]
    mediaRef.current.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  // Mute/unmute
  const toggleMute = () => {
    if (!mediaRef.current) return
    mediaRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  // Playback speed control
  const handleSpeedChange = (speed: number) => {
    if (!mediaRef.current) return
    mediaRef.current.playbackRate = speed
    setPlaybackSpeed(speed)
  }

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Download functionality
  const handleDownload = async () => {
    setIsDownloading(true)
    setDownloadProgress(0)

    try {
      // Simulate download progress
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      // Create download link
      const response = await fetch(message.url)
      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = message.name || `media-${message.id}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(downloadUrl)

      clearInterval(progressInterval)
      setDownloadProgress(100)

      toast({
        title: "Download complete",
        description: `${message.name || 'Media file'} downloaded successfully`
      })

      setTimeout(() => {
        setDownloadProgress(0)
        setIsDownloading(false)
      }, 1000)

    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download media file",
        variant: "destructive"
      })
      setIsDownloading(false)
      setDownloadProgress(0)
    }
  }

  // Render voice message
  const renderVoiceMessage = () => (
    <Card className={`p-3 max-w-xs ${
      message.isOwn 
        ? adminMode 
          ? 'bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white' 
          : 'bg-gradient-to-r from-[#2a9d8f] to-[#264653] text-white'
        : 'bg-gray-100'
    }`}>
      <audio ref={audioRef} src={message.url} preload="metadata" />
      
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePlayPause}
          className={`p-2 rounded-full ${
            message.isOwn ? 'text-white hover:bg-white/20' : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>

        {/* Waveform Visualization */}
        <div className="flex-1">
          <div className="flex items-center gap-1">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-200 ${
                  message.isOwn ? 'bg-white/60' : 'bg-gray-400'
                }`}
                style={{ 
                  height: isPlaying 
                    ? `${Math.random() * 20 + 5}px` 
                    : '8px' 
                }}
              />
            ))}
          </div>
          
          {/* Progress Bar */}
          <div className="mt-2">
            <Slider
              value={[currentTime]}
              onValueChange={handleSeek}
              max={duration || 100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs mt-1">
              <span className={message.isOwn ? 'text-white/80' : 'text-gray-500'}>
                {formatTime(currentTime)}
              </span>
              <span className={message.isOwn ? 'text-white/80' : 'text-gray-500'}>
                {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className={`p-1 rounded ${
              message.isOwn ? 'text-white hover:bg-white/20' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          
          <div className="w-16">
            <Slider
              value={[isMuted ? 0 : volume]}
              onValueChange={handleVolumeChange}
              max={1}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Playback Speed */}
      {isPlaying && (
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-xs ${message.isOwn ? 'text-white/80' : 'text-gray-500'}`}>
            Speed:
          </span>
          {[0.5, 1, 1.5, 2].map(speed => (
            <Button
              key={speed}
              variant="ghost"
              size="sm"
              onClick={() => handleSpeedChange(speed)}
              className={`text-xs px-2 py-1 rounded ${
                playbackSpeed === speed
                  ? message.isOwn ? 'bg-white text-gray-800' : 'bg-gray-800 text-white'
                  : message.isOwn ? 'text-white/60 hover:bg-white/20' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              {speed}x
            </Button>
          ))}
        </div>
      )}
    </Card>
  )

  // Render video message
  const renderVideoMessage = () => (
    <Card className={`p-2 max-w-sm ${
      message.isOwn 
        ? adminMode 
          ? 'bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white' 
          : 'bg-gradient-to-r from-[#2a9d8f] to-[#264653] text-white'
        : 'bg-gray-100'
    }`}>
      <video
        ref={videoRef}
        src={message.url}
        className="w-full rounded-lg"
        controls={false}
        preload="metadata"
      />
      
      {/* Video Controls Overlay */}
      <div className="mt-2 space-y-2">
        {/* Play/Pause Button */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePlayPause}
            className={`p-2 rounded-full ${
              message.isOwn ? 'text-white hover:bg-white/20' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          {/* Progress Bar */}
          <div className="flex-1">
            <Slider
              value={[currentTime]}
              onValueChange={handleSeek}
              max={duration || 100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs mt-1">
              <span className={message.isOwn ? 'text-white/80' : 'text-gray-500'}>
                {formatTime(currentTime)}
              </span>
              <span className={message.isOwn ? 'text-white/80' : 'text-gray-500'}>
                {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>
        
        {/* File Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            <span className="text-xs">
              {message.name || 'Video'} • {formatFileSize(message.size || 0)}
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
            className={`p-1 rounded ${
              message.isOwn ? 'text-white hover:bg-white/20' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Download Progress */}
        {isDownloading && (
          <Progress value={downloadProgress} className="h-1" />
        )}
      </div>
    </Card>
  )

  // Render image message
  const renderImageMessage = () => (
    <Card className={`p-2 max-w-sm overflow-hidden ${
      message.isOwn 
        ? adminMode 
          ? 'bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white' 
          : 'bg-gradient-to-r from-[#2a9d8f] to-[#264653] text-white'
        : 'bg-gray-100'
    }`}>
      <div className="relative">
        <img
          src={message.url}
          alt={message.name || 'Image'}
          className="w-full rounded-lg cursor-pointer"
          onClick={() => setShowPreview(true)}
        />
        
        {/* Preview Overlay */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center cursor-pointer"
          onClick={() => setShowPreview(true)}
        >
          <Eye className="h-6 w-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
        </div>
      </div>
      
      {/* Image Info */}
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          <span className="text-xs">
            {message.name || 'Image'} • {formatFileSize(message.size || 0)}
          </span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          disabled={isDownloading}
          className={`p-1 rounded ${
            message.isOwn ? 'text-white hover:bg-white/20' : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Download Progress */}
      {isDownloading && (
        <Progress value={downloadProgress} className="h-1" />
      )}
    </Card>
  )

  // Render file message
  const renderFileMessage = () => (
    <Card className={`p-3 max-w-xs ${
      message.isOwn 
        ? adminMode 
          ? 'bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white' 
          : 'bg-gradient-to-r from-[#2a9d8f] to-[#264653] text-white'
        : 'bg-gray-100'
    }`}>
      <div className="flex items-center gap-3">
        {/* File Icon */}
        <div className={`p-3 rounded-full ${
          message.isOwn ? 'bg-white/20' : 'bg-gray-200'
        }`}>
          <File className="h-6 w-6" />
        </div>
        
        {/* File Info */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${
            message.isOwn ? 'text-white' : 'text-gray-900'
          }`}>
            {message.name || 'Document'}
          </p>
          <p className={`text-xs ${
            message.isOwn ? 'text-white/80' : 'text-gray-500'
          }`}>
            {formatFileSize(message.size || 0)}
          </p>
        </div>
        
        {/* Download Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          disabled={isDownloading}
          className={`p-2 rounded-full ${
            message.isOwn ? 'text-white hover:bg-white/20' : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          {isDownloading ? (
            <div className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {/* Download Progress */}
      {isDownloading && (
        <div className="mt-2">
          <Progress value={downloadProgress} className="h-1" />
          <p className={`text-xs mt-1 ${
            message.isOwn ? 'text-white/80' : 'text-gray-500'
          }`}>
            Downloading... {downloadProgress}%
          </p>
        </div>
      )}
    </Card>
  )

  // Image Preview Modal
  const renderImagePreview = () => (
    showPreview && (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
        <div className="relative max-w-4xl max-h-full">
          <img
            src={message.url}
            alt={message.name || 'Image'}
            className="max-w-full max-h-full rounded-lg"
          />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(false)}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  )

  return (
    <>
      {message.type === 'voice' && renderVoiceMessage()}
      {message.type === 'video' && renderVideoMessage()}
      {message.type === 'image' && renderImageMessage()}
      {message.type === 'file' && renderFileMessage()}
      {renderImagePreview()}
    </>
  )
}
