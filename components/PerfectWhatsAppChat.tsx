"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  MessageCircle, 
  X, 
  Send, 
  Check, 
  CheckCheck, 
  Users, 
  Circle, 
  MessageSquare,
  Phone,
  Video,
  Search,
  ArrowLeft,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Reply,
  Forward,
  Star,
  Clock,
  Download,
  Upload,
  Wifi,
  WifiOff,
  Settings,
  Shield,
  Crown,
  RefreshCw,
  AlertTriangle,
  File,
  Mic,
  MicOff,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Eye,
  MapPin,
  ExternalLink
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { applyMobileStyles } from './MobileChatStyles'
import ChatNotificationBadge from './ChatNotificationBadge'

interface PerfectWhatsAppChatProps {
  currentUserId: string
  currentUserRole: 'admin' | 'staff'
  currentUserName: string
}

interface ChatMessage {
  id: string
  sender_id: string
  sender_name: string
  sender_role: 'admin' | 'staff'
  message: string
  message_type: 'text' | 'system' | 'notification' | 'file' | 'call'
  read: boolean
  read_at?: string
  delivered: boolean
  delivered_at?: string
  created_at: string
  updated_at?: string
  edited: boolean
  edited_at?: string
  original_message?: string
  is_deleted?: boolean
  deleted_by?: string
  deleted_at?: string
  file_url?: string
  file_name?: string
  file_size?: number
  file_type?: string
  call_type?: 'voice' | 'video'
  call_duration?: number
  call_status?: 'missed' | 'incoming' | 'outgoing' | 'completed'
}

interface GroupSettings {
  group_name: string
  allow_staff_messages: boolean
  message_retention_days: number
  auto_clear_enabled: boolean
  last_cleared_by?: string
  last_cleared_at?: string
}

interface GiphyGif {
  id: string
  title: string
  previewUrl: string
  originalUrl: string
}

interface StaffPresence {
  user_id: string
  user_name: string
  is_online: boolean
  last_seen?: string | null
  latitude?: number | null
  longitude?: number | null
  location_accuracy_meters?: number | null
  location_updated_at?: string | null
  share_location?: boolean | null
}

interface GeoLocationSnapshot {
  latitude: number
  longitude: number
  accuracy: number
  updatedAt: string
}

const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY || 'yqOnxaDn1LnngXxZCIb9zN5UQ1woEneJ'
const GIPHY_MESSAGE_PREFIX = '[GIF] '

const getGifUrlFromMessage = (message: string): string | null => {
  if (!message.startsWith(GIPHY_MESSAGE_PREFIX)) return null
  const gifUrl = message.slice(GIPHY_MESSAGE_PREFIX.length).trim()
  return gifUrl.startsWith('http') ? gifUrl : null
}

export default function PerfectWhatsAppChat({ 
  currentUserId, 
  currentUserRole, 
  currentUserName 
}: PerfectWhatsAppChatProps) {
  // Mobile viewport height management for keyboard
  const [viewportHeight, setViewportHeight] = useState(100)
  const [isMobile, setIsMobile] = useState(false)
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)

  // Apply mobile styles and handle body scroll lock
  useEffect(() => {
    let cleanupMobileStyles: () => void
    
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                           (window.innerWidth <= 768)
      setIsMobile(isMobileDevice)
      
      // Apply mobile styles when mobile detected
      if (isMobileDevice) {
        cleanupMobileStyles = applyMobileStyles()
        // Lock body scroll when chat is open on mobile
        document.body.classList.add('mobile-chat-open')
      } else {
        document.body.classList.remove('mobile-chat-open')
      }
    }

    const handleViewportChange = () => {
      if (isMobile) {
        const currentHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight
        const fullHeight = window.screen.height || window.innerHeight
        const heightPercentage = (currentHeight / fullHeight) * 100
        
        setViewportHeight(heightPercentage)
        
        // Detect if keyboard is open (height reduced by more than 20%)
        setIsKeyboardOpen(heightPercentage < 80)
      }
    }

    const handleVisualViewportChange = () => {
      if (window.visualViewport) {
        handleViewportChange()
      }
    }

    checkMobile()
    handleViewportChange()

    // Listen for viewport changes (keyboard open/close)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportChange)
    } else {
      // Fallback for browsers without visualViewport API
      window.addEventListener('resize', handleViewportChange)
    }

    // Listen for focus/blur on inputs to detect keyboard
    const handleFocus = () => setIsKeyboardOpen(true)
    const handleBlur = () => setTimeout(() => setIsKeyboardOpen(false), 100)

    const inputs = document.querySelectorAll('input, textarea')
    inputs.forEach(input => {
      input.addEventListener('focus', handleFocus)
      input.addEventListener('blur', handleBlur)
    })

    return () => {
      // Cleanup event listeners
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportChange)
      } else {
        window.removeEventListener('resize', handleViewportChange)
      }
      inputs.forEach(input => {
        input.removeEventListener('focus', handleFocus)
        input.removeEventListener('blur', handleBlur)
      })
      
      // Cleanup mobile styles and unlock body
      if (cleanupMobileStyles) {
        cleanupMobileStyles()
      }
      document.body.classList.remove('mobile-chat-open')
    }
  }, [isMobile])

  const [isOpen, setIsOpen] = useState(false)

  // Mark all messages as read when chat is opened
  const markAllMessagesAsRead = useCallback(async () => {
    try {
      await supabase
        .from('chat_messages')
        .update({ 
          read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('read', false)
        .neq('sender_id', currentUserId)

      // Update local messages to reflect read status
      setMessages(prev => prev.map(msg => 
        msg.sender_id !== currentUserId ? { ...msg, read: true, read_at: new Date().toISOString() } : msg
      ))
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }, [currentUserId])

  // Mark messages as read when chat opens
  useEffect(() => {
    if (isOpen) {
      markAllMessagesAsRead()
    }
  }, [isOpen, markAllMessagesAsRead])

  // Cleanup body lock when component unmounts or chat closes
  useEffect(() => {
    return () => {
      document.body.classList.remove('mobile-chat-open')
    }
  }, [])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<GroupSettings>({
    group_name: 'Medical Team Communication',
    allow_staff_messages: true,
    message_retention_days: 30,
    auto_clear_enabled: false
  })
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [staffPresence, setStaffPresence] = useState<StaffPresence[]>([])
  // Location tracking is intentionally admin-side only (not exposed in staff UI).
  const shareLocation = true
  const [showSettings, setShowSettings] = useState(false)
  const [showLiveLocationsPanel, setShowLiveLocationsPanel] = useState(false)
  const [selectedMapStaffId, setSelectedMapStaffId] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [pickerTab, setPickerTab] = useState<'emoji' | 'gif'>('emoji')
  const [gifQuery, setGifQuery] = useState('')
  const [gifResults, setGifResults] = useState<GiphyGif[]>([])
  const [isGifLoading, setIsGifLoading] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isInCall, setIsInCall] = useState(false)
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle')
  const [callDuration, setCallDuration] = useState(0)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const { toast } = useToast()
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const pickerRef = useRef<HTMLDivElement>(null)
  const emojiTriggerRef = useRef<HTMLButtonElement>(null)
  const latestLocationRef = useRef<GeoLocationSnapshot | null>(null)

  const upsertUserStatus = useCallback(async (payload: Record<string, unknown>) => {
    const basePayload = {
      user_id: currentUserId,
      user_name: currentUserName,
      user_role: currentUserRole,
      is_online: payload.is_online,
      last_seen: payload.last_seen,
      updated_at: payload.updated_at
    }

    const { error } = await supabase
      .from('user_status')
      .upsert(payload)

    // Keep presence updates working even before location migration is applied.
    if (error) {
      await supabase
        .from('user_status')
        .upsert(basePayload)
    }
  }, [currentUserId, currentUserName, currentUserRole])

  const updatePresence = useCallback(async (online = true, locationOverride?: GeoLocationSnapshot | null) => {
    try {
      const now = new Date().toISOString()
      const latestLocation = locationOverride ?? latestLocationRef.current
      const includeLocation = currentUserRole === 'staff' && online && shareLocation && !!latestLocation

      await upsertUserStatus({
        user_id: currentUserId,
        user_name: currentUserName,
        user_role: currentUserRole,
        is_online: online,
        last_seen: now,
        updated_at: now,
        latitude: includeLocation ? latestLocation?.latitude : null,
        longitude: includeLocation ? latestLocation?.longitude : null,
        location_accuracy_meters: includeLocation ? latestLocation?.accuracy : null,
        location_updated_at: includeLocation ? latestLocation?.updatedAt : null,
        share_location: currentUserRole === 'staff' ? shareLocation : null
      })
    } catch (error) {
      console.error('Error updating presence:', error)
    }
  }, [currentUserId, currentUserName, currentUserRole, shareLocation, upsertUserStatus])

  const loadPresence = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_status')
        .select('user_id,user_name,user_role,is_online,last_seen,latitude,longitude,location_accuracy_meters,location_updated_at,share_location')

      if (error) {
        throw error
      }

      const rows = (data || []) as Array<any>
      const online = rows.filter(user => user.is_online).map(user => user.user_name)
      setOnlineUsers(online)

      const staffRows = rows
        .filter(user => user.user_role === 'staff')
        .sort((a, b) => String(a.user_name).localeCompare(String(b.user_name)))

      setStaffPresence(staffRows)
    } catch (extendedError) {
      // Fallback if location columns are not available yet.
      try {
        const { data, error } = await supabase
          .from('user_status')
          .select('user_id,user_name,user_role,is_online,last_seen')

        if (error) {
          throw error
        }

        const rows = (data || []) as Array<any>
        const online = rows.filter(user => user.is_online).map(user => user.user_name)
        setOnlineUsers(online)

        const staffRows = rows
          .filter(user => user.user_role === 'staff')
          .sort((a, b) => String(a.user_name).localeCompare(String(b.user_name)))

        setStaffPresence(staffRows)
      } catch (baseError) {
        const msg = (baseError as any)?.message || ""
        if (msg) {
          console.warn('Presence load note:', msg)
        }
      }
    }
  }, [])

  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const targetNode = event.target as Node

      if (
        showEmojiPicker &&
        pickerRef.current &&
        !pickerRef.current.contains(targetNode) &&
        emojiTriggerRef.current &&
        !emojiTriggerRef.current.contains(targetNode)
      ) {
        setShowEmojiPicker(false)
      }

      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowEmojiPicker(false)
      }
    }

    const handleGlobalMouseUp = () => {
      if (isRecording) {
        stopRecording()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('mouseup', handleGlobalMouseUp)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      
      // Cleanup recording interval
      if ((window as any).recordingInterval) {
        clearInterval((window as any).recordingInterval)
        delete (window as any).recordingInterval
      }
    }
  }, [chatRef, isRecording, isOpen, showEmojiPicker])

  // Local storage key
  const STORAGE_KEY = 'perfect_whatsapp_chat_messages'

  // Keep global online/offline + optional staff location presence updated.
  useEffect(() => {
    if (!currentUserId) return

    updatePresence(true)
    loadPresence()

    const interval = setInterval(() => {
      updatePresence(true)
      loadPresence()
    }, 30000)

    return () => {
      clearInterval(interval)
      updatePresence(false)
    }
  }, [currentUserId, loadPresence, updatePresence])

  // Staff geolocation tracking for admin visibility.
  useEffect(() => {
    if (currentUserRole !== 'staff' || !currentUserId) return

    if (!('geolocation' in navigator)) {
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const snapshot: GeoLocationSnapshot = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          updatedAt: new Date(position.timestamp).toISOString()
        }

        latestLocationRef.current = snapshot
        updatePresence(true, snapshot)
      },
      (error) => {
        // Staff UI keeps this hidden, but log for production troubleshooting.
        console.warn('Staff geolocation capture failed:', {
          code: error.code,
          message: error.message
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000
      }
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [currentUserId, currentUserRole, updatePresence])

  // Realtime presence updates for member count + admin live-location panel.
  useEffect(() => {
    const channel = supabase
      .channel(`chat_user_status_${currentUserRole}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_status'
        },
        () => {
          loadPresence()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserRole, loadPresence])

  // Refined antique-style colors with better coordination
  const colors = {
    primary: '#0d5c75', // Your system primary color
    primaryDark: '#0a4658',
    secondary: '#faf8f5', // Soft cream
    messageSent: '#f0e6d2', // Soft antique gold
    messageReceived: '#ffffff', // Clean white
    adminMessage: '#e8f4fd', // Soft blue
    headerBg: '#1a365d', // Deep professional blue
    sidebarBg: '#f8f6f3', // Very light cream
    textPrimary: '#1a1a1a', // Dark professional text
    textSecondary: '#6b7280', // Medium gray
    onlineIndicator: '#10b981', // Modern green
    adminBadge: '#d97706', // Warm amber
    border: '#e5e7eb', // Light gray border
    shadow: 'rgba(0, 0, 0, 0.08)', // Professional shadow
    inputBg: '#ffffff', // Clean input background
    buttonPrimary: '#0d5c75', // System color for buttons
    buttonHover: '#0a4658' // Darker hover state
  }

  // Responsive dimensions - better proportions
  const getChatDimensions = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth
      const height = window.innerHeight
      
      if (width < 640) {
        // Mobile - full screen but well-proportioned
        return {
          width: '100vw',
          height: '100vh',
          position: 'fixed' as const,
          bottom: 0,
          right: 0,
          left: 0,
          top: 0
        }
      } else if (width < 1024) {
        // Tablet - balanced proportions
        return {
          width: '80vw',
          height: '75vh',
          maxWidth: '420px'
        }
      } else {
        // Desktop - perfect compact size
        return {
          width: '360px',
          height: '560px'
        }
      }
    }
    
    // Default desktop dimensions - perfect proportions
    return {
      width: '360px',
      height: '560px'
    }
  }

  const chatDimensions = getChatDimensions()

  // Load messages from local storage first (for instant display)
  const loadFromLocalStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsedMessages = JSON.parse(stored)
        const activeMessages = parsedMessages.filter((msg: ChatMessage) => !msg.is_deleted)
        setMessages(activeMessages)
      }
    } catch (error) {
      console.error('Error loading from local storage:', error)
    }
  }, [])

  // Save messages to local storage
  const saveToLocalStorage = useCallback((messages: ChatMessage[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch (error) {
      console.error('Error saving to local storage:', error)
    }
  }, [])

  // Load messages from database
  const loadMessagesFromDB = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })

      if (error) throw error

      if (data) {
        setMessages(data)
        saveToLocalStorage(data)
      }
    } catch (error: any) {
      const msg = error?.message || ""
      if (msg) console.warn('Note loading messages from DB:', msg)
      loadFromLocalStorage()
    }
  }, [loadFromLocalStorage, saveToLocalStorage])

  // Load group settings
  const loadSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('group_chat_settings')
        .select('*')

      if (error) throw error

      if (data) {
        const settingsObj: any = {}
        data.forEach(setting => {
          if (setting.setting_key === 'allow_staff_messages' || setting.setting_key === 'auto_clear_enabled') {
            settingsObj[setting.setting_key] = setting.setting_value === 'true'
          } else if (setting.setting_key === 'message_retention_days') {
            settingsObj[setting.setting_key] = parseInt(setting.setting_value) || 30
          } else {
            settingsObj[setting.setting_key] = setting.setting_value
          }
        })
        setSettings(settingsObj)
      }
    } catch (error) {
      // Quiet fallback when Supabase is disconnected/removed
      setSettings({
        group_name: 'Medical Team Communication',
        allow_staff_messages: true,
        message_retention_days: 30,
        auto_clear_enabled: false,
        last_cleared_by: 'none',
        last_cleared_at: 'never'
      })
    }
  }, [])

  // Send message
  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || isLoading) return

    if (currentUserRole === 'staff' && !settings.allow_staff_messages) {
      toast({
        title: "Message Not Sent",
        description: "Staff messages are currently disabled",
        variant: "destructive"
      })
      return
    }

    const messageText = newMessage.trim()
    setNewMessage('')
    setIsLoading(true)

    const messageObj: Partial<ChatMessage> = {
      sender_id: currentUserId,
      sender_name: currentUserName,
      sender_role: currentUserRole,
      message: messageText,
      message_type: 'text',
      read: false,
      delivered: true,
      delivered_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert(messageObj)
        .select()
        .single()

      if (error) throw error

      if (data) {
        setMessages(prev => [...prev, data])
        saveToLocalStorage([...messages, data])
        
        // Update message status (WhatsApp-style)
        updateMessageStatus(data.id)
        
        // Auto-scroll to new message
        setTimeout(() => scrollToBottom(true), 100)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      
      const localMessage: ChatMessage = {
        ...messageObj as ChatMessage,
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
      
      setMessages(prev => [...prev, localMessage])
      saveToLocalStorage([...messages, localMessage])
      
      toast({
        title: "Message Saved Locally",
        description: "Will sync when connection is restored",
        variant: "default"
      })
    } finally {
      setIsLoading(false)
    }
  }, [newMessage, isLoading, currentUserRole, settings.allow_staff_messages, currentUserId, currentUserName, messages, saveToLocalStorage, toast])

  // Delete message (admin only)
  const deleteMessage = useCallback(async (messageId: string) => {
    if (currentUserRole !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only administrators can delete messages",
        variant: "destructive"
      })
      return
    }

    try {
      const { error } = await supabase.rpc('delete_message', {
        message_id: messageId,
        admin_id: currentUserId
      })

      if (error) throw error

      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, is_deleted: true, deleted_by: currentUserId, deleted_at: new Date().toISOString() }
          : msg
      ))
      
      const updatedMessages = messages.filter(msg => msg.id !== messageId)
      saveToLocalStorage(updatedMessages)

      toast({
        title: "Message Deleted",
        description: "The message has been removed for all users"
      })
    } catch (error) {
      console.error('Error deleting message:', error)
      toast({
        title: "Delete Failed",
        description: "Could not delete message",
        variant: "destructive"
      })
    }
  }, [currentUserRole, currentUserId, messages, saveToLocalStorage, toast])

  // Clear all messages (admin only)
  const clearAllMessages = useCallback(async () => {
    if (currentUserRole !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only administrators can clear messages",
        variant: "destructive"
      })
      return
    }

    if (!confirm('Are you sure you want to clear all messages? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase.rpc('clear_all_messages', {
        admin_id: currentUserId
      })

      if (error) throw error

      setMessages([])
      saveToLocalStorage([])

      toast({
        title: "Chat Cleared",
        description: "All messages have been removed"
      })
    } catch (error) {
      console.error('Error clearing messages:', error)
      toast({
        title: "Clear Failed",
        description: "Could not clear messages",
        variant: "destructive"
      })
    }
  }, [currentUserRole, currentUserId, saveToLocalStorage, toast])

  // Real-time subscription
  useEffect(() => {
    if (!isOpen) return

    const channel = supabase
      .channel('perfect_whatsapp_chat')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `is_deleted=eq.false`
        }, 
        (payload) => {
          const newMessage = payload.new as ChatMessage
          setMessages(prev => {
            const updated = [...prev, newMessage]
            saveToLocalStorage(updated)
            return updated
          })
          
          // Auto-scroll to new message
          setTimeout(() => scrollToBottom(false), 100)
        }
      )
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          const updatedMessage = payload.new as ChatMessage
          
          if (updatedMessage.is_deleted) {
            setMessages(prev => {
              const filtered = prev.filter(msg => msg.id !== updatedMessage.id)
              saveToLocalStorage(filtered)
              return filtered
            })
          } else {
            setMessages(prev => {
              const updated = prev.map(msg => 
                msg.id === updatedMessage.id ? updatedMessage : msg
              )
              saveToLocalStorage(updated)
              return updated
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isOpen, saveToLocalStorage])

  // Initialize
  useEffect(() => {
    if (isOpen) {
      loadFromLocalStorage()
      loadMessagesFromDB()
      loadSettings()
    }
  }, [isOpen, loadFromLocalStorage, loadMessagesFromDB, loadSettings])

  // Enhanced auto-scroll to bottom with WhatsApp-like behavior
  const scrollToBottom = useCallback((force = false) => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current
      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100
      
      // Always scroll for own messages or when forced
      // For others' messages, only scroll if user is already at bottom
      if (force || isAtBottom) {
        setTimeout(() => {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          })
        }, 100)
      }
    }
  }, [])

  // WhatsApp-style message status simulation with proper read tracking
  const updateMessageStatus = useCallback(async (messageId: string) => {
    // Simulate delivery after 1 second
    setTimeout(async () => {
      try {
        await supabase
          .from('chat_messages')
          .update({ 
            delivered: true, 
            delivered_at: new Date().toISOString() 
          })
          .eq('id', messageId)
      } catch (error) {
        console.log('Failed to update delivery status')
      }
    }, 1000)

    // Mark other users' messages as read when viewed
    setTimeout(async () => {
      try {
        await supabase
          .from('chat_messages')
          .update({ 
            read: true, 
            read_at: new Date().toISOString() 
          })
          .eq('id', messageId)
          .neq('sender_id', currentUserId)
      } catch (error) {
        console.log('Failed to update read status')
      }
    }, 3000)
  }, [currentUserId])

  // Mark messages as read when chat is open
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      const unreadMessages = messages.filter(
        msg => !msg.read && msg.sender_id !== currentUserId
      )
      
      unreadMessages.forEach(async (message) => {
        try {
          await supabase
            .from('chat_messages')
            .update({ 
              read: true, 
              read_at: new Date().toISOString() 
            })
            .eq('id', message.id)
        } catch (error) {
          console.log('Failed to mark message as read')
        }
      })
    }
  }, [isOpen, messages, currentUserId])

  // Enhanced auto-scroll for new messages
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      const isFromCurrentUser = lastMessage.sender_id === currentUserId
      
      // Always scroll for own messages, scroll for others if at bottom
      scrollToBottom(isFromCurrentUser)
    }
  }, [messages, currentUserId, scrollToBottom])

  // Scroll on initial load
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      setTimeout(() => scrollToBottom(true), 100)
    }
  }, [isOpen, messages.length, scrollToBottom])

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    let hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours ? hours : 12 // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes
    return `${hours}:${minutesStr} ${ampm}`
  }

  const activeMessages = messages.filter(msg => !msg.is_deleted)

  const formatLocationAge = (updatedAt?: string | null) => {
    if (!updatedAt) return 'Unknown update time'

    const seconds = Math.max(0, Math.floor((Date.now() - new Date(updatedAt).getTime()) / 1000))
    if (seconds < 60) return 'Updated just now'

    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `Updated ${minutes}m ago`

    const hours = Math.floor(minutes / 60)
    return `Updated ${hours}h ago`
  }

  const activeStaffWithLocation = staffPresence.filter((staff) =>
    staff.is_online &&
    staff.share_location !== false &&
    typeof staff.latitude === 'number' &&
    typeof staff.longitude === 'number'
  )

  const selectedMapStaff = activeStaffWithLocation.find((staff) => staff.user_id === selectedMapStaffId)

  const embeddedMapUrl =
    selectedMapStaff &&
    typeof selectedMapStaff.latitude === 'number' &&
    typeof selectedMapStaff.longitude === 'number'
      ? `https://maps.google.com/maps?q=${selectedMapStaff.latitude},${selectedMapStaff.longitude}&z=15&output=embed`
      : ''

  useEffect(() => {
    if (currentUserRole !== 'admin') return

    if (!selectedMapStaffId && activeStaffWithLocation.length > 0) {
      setSelectedMapStaffId(activeStaffWithLocation[0].user_id)
      return
    }

    if (
      selectedMapStaffId &&
      !activeStaffWithLocation.some((staff) => staff.user_id === selectedMapStaffId)
    ) {
      setSelectedMapStaffId(activeStaffWithLocation[0]?.user_id || '')
    }
  }, [activeStaffWithLocation, currentUserRole, selectedMapStaffId])

  // Common emojis list
  const commonEmojis = ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤏', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🙏', '🤝', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👩', '🧓', '👴', '👵', '🙍', '🙎', '🙅', '🙆', '💁', '🙋', '🧏', '🙇', '🤦', '🤷', '👨‍⚕️', '👩‍⚕️', '👨‍🎓', '👩‍🎓', '👨‍🏫', '👩‍🏫', '👨‍⚖️', '👩‍⚖️', '👨‍🌾', '👩‍🌾', '👨‍🍳', '👩‍🍳', '👨‍🔧', '👩‍🔧', '👨‍🏭', '👩‍🏭', '👨‍💼', '👩‍💼', '👨‍🔬', '👩‍🔬', '👨‍💻', '👩‍💻', '👨‍🎤', '👩‍🎤', '👨‍🎨', '👩‍🎨', '👨‍✈️', '👩‍✈️', '👨‍🚀', '👩‍🚀', '👨‍🚒', '👩‍🚒', '👮', '🕵️', '💂', '👷', '🤴', '👸', '👳', '👲', '🧕', '🤵', '👰', '🤰', '🤱', '👼', '🎅', '🤶', '🦸', '🦹', '🧙', '🧝', '🧛', '🧟', '🧞', '🧜', '🧚', '🧞‍♂️', '🧞‍♀️', '🧟‍♂️', '🧟‍♀️', '🧛‍♂️', '🧛‍♀️', '🧜‍♂️', '🧜‍♀️', '🧚‍♂️', '🧚‍♀️', '🧙‍♂️', '🧙‍♀️', '💂‍♂️', '💂‍♀️', '👮‍♂️', '👮‍♀️', '🕵️‍♂️', '🕵️‍♀️', '👷‍♂️', '👷‍♀️', '🤴‍♂️', '👸‍♀️', '👳‍♂️', '🧕‍♀️', '🧔‍♂️', '👱‍♀️', '👱‍♂️', '👨‍🦰', '👩‍🦰', '👨‍🦱', '👩‍🦱', '👨‍🦳', '👩‍🦳', '👨‍🦲', '👩‍🦲', '🙋‍♂️', '🙋‍♀️', '🙇‍♂️', '🙇‍♀️', '🙏', '🤝', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄']

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji)
    inputRef.current?.focus()
  }

  const fetchGifs = useCallback(async (query: string, signal?: AbortSignal) => {
    if (!GIPHY_API_KEY) {
      setGifResults([])
      return
    }

    setIsGifLoading(true)
    try {
      const endpoint = query
        ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=16&rating=pg-13&lang=en`
        : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=16&rating=pg-13`

      const response = await fetch(endpoint, { signal })
      if (!response.ok) {
        throw new Error(`Failed to fetch GIFs: ${response.status}`)
      }

      const payload = await response.json()
      const gifs: GiphyGif[] = (payload?.data || []).map((item: any) => ({
        id: item.id,
        title: item.title || 'GIF',
        previewUrl: item.images?.fixed_width?.url || item.images?.downsized?.url || item.images?.original?.url,
        originalUrl: item.images?.original?.url || item.images?.fixed_width?.url
      })).filter((item: GiphyGif) => Boolean(item.previewUrl && item.originalUrl))

      setGifResults(gifs)
    } catch (error) {
      if ((error as Error)?.name !== 'AbortError') {
        console.error('Error loading GIFs:', error)
        setGifResults([])
      }
    } finally {
      setIsGifLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!showEmojiPicker || pickerTab !== 'gif') return

    const controller = new AbortController()
    const timer = setTimeout(() => {
      fetchGifs(gifQuery.trim(), controller.signal)
    }, 300)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [showEmojiPicker, pickerTab, gifQuery, fetchGifs])

  const handleGifSelect = (gifUrl: string) => {
    setNewMessage(prev => `${prev}${prev ? '\n' : ''}${GIPHY_MESSAGE_PREFIX}${gifUrl}`)
    setShowEmojiPicker(false)
    inputRef.current?.focus()
  }

  // Handle voice recording - DISABLED
  const startRecording = async () => {
    // Voice recording functionality disabled
    toast({
      title: "Feature Disabled",
      description: "Voice recording is currently unavailable",
      variant: "destructive"
    })
  }

  const stopRecording = () => {
    // Voice recording functionality disabled
    setIsRecording(false)
    setRecordingTime(0)
  }

  // Handle call functionality - DISABLED
  const startCall = async (type: 'voice' | 'video') => {
    // Call functionality disabled
    toast({
      title: "Feature Disabled",
      description: `${type === 'voice' ? 'Voice' : 'Video'} calls are currently unavailable`,
      variant: "destructive"
    })
  }

  const endCall = () => {
    // Call functionality disabled
    setCallStatus('idle')
    setIsInCall(false)
    setCallDuration(0)
  }

  const startCallTimer = () => {
    ;(window as any).callTimer = setInterval(() => {
      setCallDuration(prev => prev + 1)
    }, 1000)
  }

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Professional luxury floating chat button with premium animations
  // Only show when chat is closed
  if (!isOpen) {
    return (
      <div className="fixed bottom-0 right-0 z-40" data-chat-role={currentUserRole} data-chat-user={currentUserId}>
        <div className="relative group">
          {/* Main luxury button - minimal animations */}
          <button
            onClick={() => {
              setIsOpen(true)
              markAllMessagesAsRead()
            }}
            className="relative w-12 h-12 rounded-full shadow-xl transition-all duration-200 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-white/20 m-4"
            style={{
              background: 'linear-gradient(145deg, #1e293b 0%, #334155 50%, #475569 100%)',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              cursor: 'pointer'
            }}
          >
            {/* Inner metallic gradient */}
            <div className="absolute inset-1 rounded-full bg-gradient-to-br from-gray-700/50 to-gray-900/50 backdrop-blur-sm"></div>
            
            {/* Premium message icon */}
            <div className="relative z-10 flex items-center justify-center">
              {/* Icon background circle */}
              <div className="absolute inset-1.5 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm"></div>
              
              {/* Message icon */}
              <svg 
                className="relative w-5 h-5 text-white drop-shadow-lg" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))' }}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                />
              </svg>
              
              {/* Status indicator - static */}
              <div className="absolute bottom-0.5 right-0.5 w-2 h-2">
                <div className="w-full h-full bg-green-400 rounded-full"></div>
              </div>
            </div>
            
            {/* Notification Badge - Perfect Mobile Style */}
            <ChatNotificationBadge 
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
            />
          </button>
          
          {/* Simple tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
            <div className="relative">
              {/* Tooltip content */}
              <div className="bg-gray-900/95 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg shadow-lg border border-white/10">
                <div className="flex items-center space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  <span className="font-medium">
                    Open chat to view messages
                  </span>
                </div>
              </div>
              
              {/* Tooltip arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                <div className="w-0 h-0 border-l-3 border-r-3 border-t-3 border-transparent border-t-gray-900/95"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={chatRef}
      className="flex flex-col"
      data-chat-role={currentUserRole}
      data-chat-user={currentUserId}
      data-chat-interface="true"
      style={{
        position: chatDimensions.position || 'fixed',
        bottom: chatDimensions.bottom !== undefined ? chatDimensions.bottom : '1.5rem',
        right: chatDimensions.right !== undefined ? chatDimensions.right : '1.5rem',
        left: chatDimensions.left || 'auto',
        top: chatDimensions.top || 'auto',
        zIndex: 10000
      }}
    >
      {/* Chat Window - Mobile Optimized */}
      <Card 
        className={`shadow-2xl border overflow-hidden flex flex-col ${
          isMobile ? 'fixed inset-0 rounded-none mobile-chat-container' : ''
        }`}
        style={{
          width: isMobile ? '100vw' : chatDimensions.width,
          height: isMobile ? '100vh' : chatDimensions.height,
          maxWidth: chatDimensions.maxWidth || 'none',
          backgroundColor: colors.messageReceived,
          borderColor: colors.border,
          boxShadow: `0 10px 40px ${colors.shadow}, 0 0 0 1px ${colors.border}`,
          // Mobile-specific positioning
          ...(isMobile && {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            borderRadius: '0'
          })
        }}
      >
        {/* Perfect Chat Header - Mobile Fixed */}
        <CardHeader 
          className={`px-4 py-3 flex-shrink-0 border-b transition-all duration-300 ${
            isMobile ? 'sticky top-0 z-40 mobile-chat-header' : ''
          }`}
          style={{ 
            backgroundColor: colors.headerBg, 
            borderColor: 'rgba(255,255,255,0.1)',
            // Mobile-specific header styling
            ...(isMobile && {
              position: 'sticky',
              top: 0,
              zIndex: 100,
              minHeight: '60px'
            })
          }}
        >
          {/* Primary Header Row */}
          <div className="flex items-center justify-between">
            {/* Left Section - Chat Identity */}
            <div className="flex items-center space-x-3">
              {/* Chat Icon with Status */}
              <div className="relative">
                <MessageSquare className="h-4.5 w-4.5 text-white/95" />
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full border border-white/90"></div>
              </div>
              
              {/* Chat Title */}
              <div>
                <h2 className="text-white font-semibold text-sm leading-tight">
                  {settings.group_name}
                </h2>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-xs text-white/60">
                    {onlineUsers.length} members
                  </span>
                  <span className="text-xs text-white/40">•</span>
                  <span className="text-xs text-white/60">
                    {formatTime(new Date().toISOString())}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Right Section - Status & Actions */}
            <div className="flex items-center space-x-2">
              {/* Connection Status */}
              <div className="flex items-center space-x-1 px-2 py-1 bg-green-500/10 rounded-md">
                <Wifi className="h-3 w-3 text-green-400" />
                <span className="text-xs font-medium text-green-300">Online</span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-0.5">
                {/* Voice Call */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startCall('voice')}
                  disabled={isInCall}
                  className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-md transition-colors"
                  title="Voice Call"
                >
                  <Phone className="h-3.5 w-3.5" />
                </Button>
                
                {/* Video Call */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startCall('video')}
                  disabled={isInCall}
                  className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-md transition-colors"
                  title="Video Call"
                >
                  <Video className="h-3.5 w-3.5" />
                </Button>
                
                {/* Admin Settings */}
                {currentUserRole === 'admin' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLiveLocationsPanel(!showLiveLocationsPanel)}
                    className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-md transition-colors"
                    title="Live Locations"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                  </Button>
                )}

                {currentUserRole === 'admin' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(!showSettings)}
                    className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-md transition-colors"
                    title="Settings"
                  >
                    <Settings className="h-3.5 w-3.5" />
                  </Button>
                )}
                
                {/* Close */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-md transition-colors"
                  title="Close"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Admin Authority Bar - Only for Admin */}
          {currentUserRole === 'admin' && (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
              <div className="flex items-center space-x-2">
                <Shield className="h-3 w-3 text-amber-400" />
                <span className="text-xs font-medium text-amber-300">Administrator Access</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-white/50">
                <span>Staff Messages: {settings.allow_staff_messages ? 'Enabled' : 'Disabled'}</span>
                <span>•</span>
                <span>Auto-clear: {settings.auto_clear_enabled ? 'On' : 'Off'}</span>
              </div>
            </div>
          )}
          
          {/* Staff Status Bar - Only for Staff */}
          {currentUserRole === 'staff' && (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
              <div className="flex items-center space-x-2">
                <Users className="h-3 w-3 text-blue-400" />
                <span className="text-xs font-medium text-blue-300">Staff Member</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-white/50">
                <span className={`flex items-center space-x-1 ${settings.allow_staff_messages ? 'text-green-400' : 'text-orange-400'}`}>
                  <Circle className={`h-2 w-2 fill-current ${settings.allow_staff_messages ? 'text-green-400' : 'text-orange-400'}`} />
                  Messages {settings.allow_staff_messages ? 'Enabled' : 'Disabled'}
                </span>
                <span className="text-white/30">•</span>
                <span className="text-white/50">Role: {currentUserName}</span>
              </div>
            </div>
          )}
        </CardHeader>

        {currentUserRole === 'admin' && showLiveLocationsPanel && (
          <div className="p-3 border-b flex-shrink-0 bg-white" style={{ borderColor: colors.border }}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#0d5c75]" />
                  <span className="text-sm font-semibold text-gray-900">Live Staff Locations</span>
                </div>
                <span className="text-xs text-gray-500">
                  Active with location: {activeStaffWithLocation.length}
                </span>
              </div>

              {activeStaffWithLocation.length === 0 ? (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-800">
                  No active staff location yet. Ask staff to keep the mobile dashboard open and allow location permission.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-2 max-h-36 overflow-y-auto pr-1">
                    {activeStaffWithLocation.map((staff) => {
                      const mapsUrl = `https://www.google.com/maps?q=${staff.latitude},${staff.longitude}`
                      const isSelected = selectedMapStaffId === staff.user_id

                      return (
                        <div
                          key={staff.user_id}
                          className={`rounded-md border p-2 text-xs ${isSelected ? 'border-[#0d5c75] bg-[#0d5c75]/5' : 'border-gray-200 bg-white'}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedMapStaffId(staff.user_id)}
                              className="text-left"
                            >
                              <div className="font-medium text-gray-800">{staff.user_name}</div>
                              <div className="text-gray-500">{formatLocationAge(staff.location_updated_at)}</div>
                              {staff.location_accuracy_meters != null && (
                                <div className="text-gray-500">Accuracy: {Math.round(staff.location_accuracy_meters)}m</div>
                              )}
                            </button>
                            <a
                              href={mapsUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 underline whitespace-nowrap"
                            >
                              Open Maps
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {selectedMapStaff && embeddedMapUrl && (
                    <div className="rounded-md border border-gray-200 overflow-hidden">
                      <div className="px-2 py-1 text-xs bg-gray-50 border-b border-gray-200 text-gray-600">
                        Live map: {selectedMapStaff.user_name}
                      </div>
                      <iframe
                        title={`Live map for ${selectedMapStaff.user_name}`}
                        src={embeddedMapUrl}
                        className="w-full h-40"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Fixed Admin Settings Panel */}
        {currentUserRole === 'admin' && showSettings && (
          <div className="p-3 border-b flex-shrink-0" style={{ backgroundColor: colors.secondary, borderColor: colors.border }}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>Staff Messages</span>
                <Button
                  variant={settings.allow_staff_messages ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSettings(prev => ({
                      ...prev,
                      allow_staff_messages: !prev.allow_staff_messages
                    }))
                  }}
                  className={`text-xs px-3 py-1.5 h-7 transition-colors ${
                    settings.allow_staff_messages 
                      ? "bg-blue-600 hover:bg-blue-700 text-white" 
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {settings.allow_staff_messages ? "Enabled" : "Disabled"}
                </Button>
              </div>
              
              <Separator style={{ backgroundColor: colors.border }} />

              <div className="space-y-2">
                <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>Staff Live Locations</span>
                {staffPresence.length === 0 ? (
                  <p className="text-xs text-gray-500">No staff presence available yet.</p>
                ) : (
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {!staffPresence.some((staff) =>
                      staff.share_location !== false &&
                      typeof staff.latitude === 'number' &&
                      typeof staff.longitude === 'number'
                    ) && (
                      <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-800">
                        Live coordinates have not been received yet. Verify production DB migration and staff browser location permission.
                      </div>
                    )}
                    {staffPresence.map((staff) => {
                      const hasLocation =
                        staff.share_location !== false &&
                        typeof staff.latitude === 'number' &&
                        typeof staff.longitude === 'number'

                      const mapsUrl = hasLocation
                        ? `https://www.google.com/maps?q=${staff.latitude},${staff.longitude}`
                        : ''

                      return (
                        <div key={staff.user_id} className="rounded-md border border-gray-200 bg-white p-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-800">{staff.user_name}</span>
                            <span className={staff.is_online ? 'text-green-600' : 'text-gray-500'}>
                              {staff.is_online ? 'Online' : 'Offline'}
                            </span>
                          </div>

                          {hasLocation ? (
                            <div className="mt-1 space-y-1 text-gray-600">
                              <div>{formatLocationAge(staff.location_updated_at)}</div>
                              {staff.location_accuracy_meters != null && (
                                <div>Accuracy: {Math.round(staff.location_accuracy_meters)}m</div>
                              )}
                              <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 underline"
                              >
                                Open in Google Maps
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          ) : (
                            <div className="mt-1 text-gray-500">Location not shared</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={clearAllMessages}
                  className="flex items-center space-x-1.5 text-xs px-3 py-1.5 h-7 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Clear All</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    loadMessagesFromDB()
                    toast({
                      title: "Refreshed",
                      description: "Messages have been synchronized"
                    })
                  }}
                  className="flex items-center space-x-1.5 text-xs px-3 py-1.5 h-7 border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Sync</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Messages Area - Mobile Optimized */}
        <div 
          ref={messagesContainerRef}
          className={`flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300 ${
            isMobile && isKeyboardOpen ? 'pb-2 mobile-chat-messages' : 'mobile-chat-messages'
          }`}
          style={{ 
            backgroundColor: colors.sidebarBg,
            scrollbarWidth: 'none', /* Firefox */
            msOverflowStyle: 'none', /* IE and Edge */
            // Mobile-specific height management
            ...(isMobile && {
              height: isKeyboardOpen 
                ? `calc(${viewportHeight}vh - 120px)` // Header (60px) + Input (60px)
                : `calc(${viewportHeight}vh - 120px)`, // Same calculation
              maxHeight: isKeyboardOpen 
                ? `calc(${viewportHeight}vh - 120px)`
                : `calc(${viewportHeight}vh - 120px)`
            })
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none; /* Chrome, Safari and Opera */
            }
            div::-webkit-scrollbar-track {
              display: none;
            }
            div::-webkit-scrollbar-thumb {
              display: none;
            }
            div::-webkit-scrollbar-button {
              display: none;
            }
          `}</style>
          <div className="p-3 space-y-2">
            {activeMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: colors.textPrimary }}>
                  No messages yet
                </h3>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  {currentUserRole === 'admin' 
                    ? "Start the conversation with your team" 
                    : settings.allow_staff_messages 
                    ? "Send a message to start chatting" 
                    : "Waiting for admin to enable messages..."
                  }
                </p>
              </div>
            ) : (
              activeMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
                  } mb-2`}
                >
                  <div className="max-w-[75%]">
                    {/* Sender info for other users' messages */}
                    {message.sender_id !== currentUserId && (
                      <div className="flex items-center space-x-1.5 mb-1 px-1">
                        <span className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                          {message.sender_name}
                        </span>
                        {message.sender_role === 'admin' && (
                          <Crown className="h-3 w-3" style={{ color: colors.adminBadge }} />
                        )}
                      </div>
                    )}
                    
                    <div
                      className="rounded-2xl px-3 py-2 shadow-sm border"
                      style={{
                        backgroundColor: message.sender_id === currentUserId 
                          ? colors.messageSent 
                          : message.sender_role === 'admin' 
                          ? colors.adminMessage 
                          : colors.messageReceived,
                        borderColor: colors.border,
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      {/* Call Message */}
                      {message.message_type === 'call' && (
                        <div className="flex items-center space-x-2">
                          {message.call_type === 'voice' ? (
                            <PhoneCall className="w-5 h-5 text-green-500" />
                          ) : (
                            <Video className="w-5 h-5 text-blue-500" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm" style={{ color: colors.textPrimary }}>
                              {message.message}
                            </p>
                            {message.call_duration && (
                              <p className="text-xs" style={{ color: colors.textSecondary }}>
                                Duration: {formatCallDuration(message.call_duration)}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Text Message */}
                      {message.message_type === 'text' && (
                        (() => {
                          const gifUrl = getGifUrlFromMessage(message.message)

                          if (gifUrl) {
                            return (
                              <div className="space-y-1">
                                <img
                                  src={gifUrl}
                                  alt="Shared GIF"
                                  className="rounded-lg w-full max-w-[220px] h-auto object-cover"
                                  loading="lazy"
                                />
                                <p className="text-[10px]" style={{ color: colors.textSecondary }}>
                                  GIF message
                                </p>
                              </div>
                            )
                          }

                          return (
                            <p className="text-sm break-words leading-relaxed" style={{ color: colors.textPrimary }}>
                              {message.message}
                            </p>
                          )
                        })()
                      )}
                      
                      {/* WhatsApp-style Message Status - Fixed positioning inside textbox */}
                      <div className="flex items-center justify-end mt-1 text-xs">
                        <span style={{ color: colors.textSecondary }}>{formatTime(message.created_at)}</span>
                        {message.edited && <span style={{ color: colors.textSecondary }}>edited</span>}
                        {message.sender_id === currentUserId && (
                          <div className="flex items-center ml-1">
                            {message.read ? (
                              <div className="flex items-center h-3">
                                {/* Bottom check - blue when read */}
                                <svg 
                                  className="w-3 h-3" 
                                  style={{ color: '#53bdeb' }}
                                  fill="currentColor" 
                                  viewBox="0 0 20 20"
                                >
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {/* Top check - overlapping, blue when read */}
                                <svg 
                                  className="w-3 h-3 -ml-1.5" 
                                  style={{ color: '#53bdeb' }}
                                  fill="currentColor" 
                                  viewBox="0 0 20 20"
                                >
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            ) : message.delivered ? (
                              <div className="flex items-center h-3">
                                {/* Bottom check - gray when delivered but not read */}
                                <svg 
                                  className="w-3 h-3" 
                                  style={{ color: colors.textSecondary }}
                                  fill="currentColor" 
                                  viewBox="0 0 20 20"
                                >
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {/* Top check - overlapping, gray when delivered but not read */}
                                <svg 
                                  className="w-3 h-3 -ml-1.5" 
                                  style={{ color: colors.textSecondary }}
                                  fill="currentColor" 
                                  viewBox="0 0 20 20"
                                >
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            ) : (
                              /* Single check - gray when sent but not delivered */
                              <svg 
                                className="w-3 h-3" 
                                style={{ color: colors.textSecondary }}
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                              >
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Admin delete button for other users' messages */}
                    {currentUserRole === 'admin' && message.sender_id !== currentUserId && (
                      <div className="flex justify-end mt-1 px-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMessage(message.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-6 w-6 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} className="h-2" />
          </div>
        </div>

        {/* Enhanced Message Input - Mobile Fixed */}
        <div 
          className={`p-3 border-t flex-shrink-0 transition-all duration-300 ${
            isMobile ? 'sticky bottom-0 z-40 mobile-chat-input' : ''
          }`}
          style={{ 
            backgroundColor: colors.messageReceived, 
            borderColor: colors.border,
            // Mobile-specific input area styling
            ...(isMobile && {
              position: 'sticky',
              bottom: 0,
              zIndex: 40,
              minHeight: '60px',
              // Ensure it's always above keyboard
              paddingBottom: isKeyboardOpen ? 'env(safe-area-inset-bottom, 10px)' : '12px'
            })
          }}
        >
          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="px-3 py-1 mb-2 text-xs text-gray-500 italic">
              {typingUsers.length === 1 ? `${typingUsers[0]} is typing...` : `${typingUsers.length} people are typing...`}
            </div>
          )}
          
          {currentUserRole === 'staff' && !settings.allow_staff_messages && (
            <div className="mb-2 p-2 rounded-lg" style={{ backgroundColor: '#fef3c7', border: `1px solid #f59e0b` }}>
              <p className="text-xs" style={{ color: '#92400e' }}>
                <AlertTriangle className="h-3 w-3 inline mr-1" />
                Staff messages are currently disabled by administrator
              </p>
            </div>
          )}
          
          <div className="flex items-end space-x-2">
            {/* Emoji Picker Button */}
            <div className="relative">
              <Button
                ref={emojiTriggerRef}
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowEmojiPicker(!showEmojiPicker)
                  setPickerTab('emoji')
                }}
                className="text-gray-500 hover:text-gray-700 p-2 transition-colors"
                title="Open emoji picker"
              >
                😊
              </Button>
              
              {/* Emoji + GIF Picker */}
              {showEmojiPicker && (
                <div ref={pickerRef} className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-2xl border border-gray-200 p-3 z-40 w-80">
                  <div className="mb-2 pb-2 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPickerTab('emoji')}
                        className={`px-2 py-1 text-xs rounded-md transition-colors ${pickerTab === 'emoji' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        Emoji
                      </button>
                      <button
                        type="button"
                        onClick={() => setPickerTab('gif')}
                        className={`px-2 py-1 text-xs rounded-md transition-colors ${pickerTab === 'gif' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        GIF
                      </button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowEmojiPicker(false)}
                      className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700"
                      title="Close picker"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {pickerTab === 'emoji' ? (
                    <div className="grid grid-cols-8 gap-1 max-h-60 overflow-y-auto">
                      {commonEmojis.map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => handleEmojiSelect(emoji)}
                          className="text-2xl hover:bg-gray-100 rounded p-2 transition-colors hover:scale-110 transform"
                          title={emoji}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <>
                      <Input
                        value={gifQuery}
                        onChange={(e) => setGifQuery(e.target.value)}
                        placeholder="Search GIFs..."
                        className="h-8 text-sm mb-2"
                      />

                      <div className="h-56 overflow-y-auto pr-1">
                        {isGifLoading ? (
                          <div className="h-full flex items-center justify-center text-sm text-gray-500">
                            Loading GIFs...
                          </div>
                        ) : gifResults.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-sm text-gray-500 text-center px-4">
                            No GIFs found. Try another keyword.
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            {gifResults.map((gif) => (
                              <button
                                key={gif.id}
                                onClick={() => handleGifSelect(gif.originalUrl)}
                                className="rounded-md overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors"
                                title={gif.title || 'GIF'}
                              >
                                <img
                                  src={gif.previewUrl}
                                  alt={gif.title || 'GIF'}
                                  className="w-full h-24 object-cover"
                                  loading="lazy"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <span className="text-[10px] text-gray-400">Powered by GIPHY</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Voice Recording Button */}
            <Button
              variant="ghost"
              size="sm"
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className={`p-2 transition-colors ${isRecording ? 'text-red-500 bg-red-50' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {isRecording ? (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <span className="text-xs text-red-500 font-medium">{recordingTime}s</span>
                </div>
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            
            {/* Multi-line Text Input */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                placeholder={
                  currentUserRole === 'staff' && !settings.allow_staff_messages
                    ? "Messages disabled"
                    : "Type a message..."
                }
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value)
                  // Auto-resize textarea
                  e.target.style.height = 'auto'
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
                  
                  // Simulate typing indicator
                  if (e.target.value.length > 0 && !isTyping) {
                    setIsTyping(true)
                    setTimeout(() => setIsTyping(false), 1000)
                  }
                }}
                onFocus={() => {
                  // Simulate typing when focused
                  if (newMessage.length > 0) {
                    setIsTyping(true)
                  }
                }}
                onBlur={() => setIsTyping(false)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                disabled={
                  (currentUserRole === 'staff' && !settings.allow_staff_messages) ||
                  isLoading
                }
                className={`w-full text-sm resize-none rounded-lg border px-3 py-2 max-h-32 ${
                  isMobile ? 'mobile-chat-input' : ''
                }`}
                style={{ 
                  backgroundColor: colors.inputBg,
                  borderColor: colors.border,
                  // Mobile-specific input styling to prevent zoom
                  ...(isMobile && {
                    fontSize: '16px !important',
                    transform: 'scale(0.875)',
                    transformOrigin: 'left top'
                  }),
                  color: colors.textPrimary,
                  fontSize: '0.875rem',
                  borderWidth: '1px',
                  minHeight: '40px',
                  lineHeight: '1.4'
                }}
                rows={1}
              />
            </div>
            
            {/* Send Button */}
            <Button
              onClick={sendMessage}
              disabled={
                !newMessage.trim() ||
                isLoading ||
                (currentUserRole === 'staff' && !settings.allow_staff_messages)
              }
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 min-w-[36px] h-9 transition-colors"
              style={{ backgroundColor: colors.buttonPrimary }}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : newMessage.trim() ? (
                <Send className="h-4 w-4" />
              ) : (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5-1.428a1 1 0 00.576-1.409l-7-14z" />
                </svg>
              )}
            </Button>
          </div>
          
          {/* Call Overlay */}
          {isInCall && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-40 rounded-lg">
              <div className="bg-white rounded-lg p-6 text-center">
                <div className="mb-4">
                  {callStatus === 'calling' && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-6 h-6 text-green-500 animate-pulse" />
                      <span className="text-lg font-medium">Calling...</span>
                    </div>
                  )}
                  {callStatus === 'connected' && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-6 h-6 text-green-500" />
                      <span className="text-lg font-medium">{formatCallDuration(callDuration)}</span>
                    </div>
                  )}
                </div>
                <Button
                  onClick={endCall}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  End Call
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
