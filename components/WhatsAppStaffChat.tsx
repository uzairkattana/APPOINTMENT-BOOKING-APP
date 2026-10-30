'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { MessageCircle, X, Send, Check, CheckCheck, MapPin, MapPinOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface WhatsAppStaffChatProps {
  staffId: string
  staffName: string
  adminId?: string
}

interface ChatMessage {
  id: string
  sender_id: string
  sender_name: string
  sender_role: string
  receiver_id: string
  receiver_role: string
  message: string
  read: boolean
  read_at?: string
  delivered: boolean
  delivered_at?: string
  created_at: string
}

interface StaffGeoLocation {
  latitude: number
  longitude: number
  accuracy: number
  updatedAt: string
}

export default function WhatsAppStaffChat({ staffId, staffName, adminId = 'admin-user' }: WhatsAppStaffChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isOnline, setIsOnline] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [shareLocation, setShareLocation] = useState(true)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const subscriptionRef = useRef<any>(null)
  const latestLocationRef = useRef<StaffGeoLocation | null>(null)
  const { toast } = useToast()

  const upsertUserStatus = useCallback(async (payload: Record<string, unknown>) => {
    const basePayload = {
      user_id: staffId,
      user_name: staffName,
      user_role: 'staff',
      is_online: payload.is_online,
      last_seen: payload.last_seen,
      updated_at: payload.updated_at
    }

    const { error } = await supabase
      .from('user_status')
      .upsert(payload)

    // Keep chat online/offline status working even if location columns are not yet added.
    if (error) {
      await supabase
        .from('user_status')
        .upsert(basePayload)
    }
  }, [staffId, staffName])

  const updateOnlineStatus = useCallback(async (online = true) => {
    try {
      const now = new Date().toISOString()
      const latestLocation = latestLocationRef.current
      const includeLocation = online && shareLocation && !!latestLocation

      await upsertUserStatus({
        user_id: staffId,
        user_name: staffName,
        user_role: 'staff',
        is_online: online,
        last_seen: now,
        updated_at: now,
        latitude: includeLocation ? latestLocation?.latitude : null,
        longitude: includeLocation ? latestLocation?.longitude : null,
        location_accuracy_meters: includeLocation ? latestLocation?.accuracy : null,
        location_updated_at: includeLocation ? latestLocation?.updatedAt : null,
        share_location: shareLocation
      })
    } catch (error) {
      console.error('Error updating online status:', error)
    }
  }, [shareLocation, staffId, staffName, upsertUserStatus])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Update online status
  useEffect(() => {
    if (staffId) {
      updateOnlineStatus(true)
      const interval = setInterval(() => updateOnlineStatus(true), 30000) // Update every 30 seconds
      
      return () => {
        clearInterval(interval)
        updateOnlineStatus(false)
      }
    }
  }, [staffId, updateOnlineStatus])

  // Track staff location and publish to admin presence.
  useEffect(() => {
    if (!staffId || !shareLocation) {
      latestLocationRef.current = null
      setLocationError(null)
      setHasLocationPermission(null)
      return
    }

    if (!('geolocation' in navigator)) {
      setLocationError('Location is not supported in this browser')
      setHasLocationPermission(false)
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setHasLocationPermission(true)
        setLocationError(null)

        latestLocationRef.current = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          updatedAt: new Date(position.timestamp).toISOString()
        }

        updateOnlineStatus(true)
      },
      (error) => {
        setHasLocationPermission(false)

        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Location permission denied')
        } else if (error.code === error.TIMEOUT) {
          setLocationError('Location request timed out')
        } else {
          setLocationError('Unable to fetch location')
        }
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
  }, [shareLocation, staffId, updateOnlineStatus])

  // Check admin online status
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data } = await supabase
          .from('user_status')
          .select('is_online')
          .eq('user_id', adminId)
          .single()
        
        setIsOnline(data?.is_online || false)
      } catch (error) {
        console.error('Error checking admin status:', error)
      }
    }

    if (adminId) {
      checkAdminStatus()
      const interval = setInterval(checkAdminStatus, 10000) // Check every 10 seconds
      return () => clearInterval(interval)
    }
  }, [adminId])

  // Load messages
  const loadMessages = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error

      const filteredMessages = data?.filter(msg => 
        (msg.sender_id === staffId && msg.receiver_id === adminId) ||
        (msg.sender_id === adminId && msg.receiver_id === staffId)
      ) || []

      setMessages(filteredMessages)
      
      // Mark admin messages as read
      const adminMessages = filteredMessages.filter(msg => 
        msg.sender_id === adminId && !msg.read
      )
      
      if (adminMessages.length > 0) {
        await supabase
          .from('chat_messages')
          .update({ 
            read: true, 
            read_at: new Date().toISOString() 
          })
          .in('id', adminMessages.map(msg => msg.id))
      }
    } catch (error) {
      console.error('Error loading messages:', error)
      toast({
        title: "Error loading messages",
        description: "Please try again later",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Real-time subscription
  useEffect(() => {
    if (isOpen && staffId) {
      loadMessages()
      setupRealtimeSubscription()
    }
    
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current)
      }
    }
  }, [isOpen, staffId])

  const setupRealtimeSubscription = () => {
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current)
    }

    const channel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as ChatMessage
            
            if ((newMessage.sender_id === staffId && newMessage.receiver_id === adminId) ||
                (newMessage.sender_id === adminId && newMessage.receiver_id === staffId)) {
              
              setMessages(prev => [...prev, newMessage])
              
              if (newMessage.sender_role === 'admin' && !isOpen) {
                setUnreadCount(prev => prev + 1)
                toast({
                  title: "New message from Admin",
                  description: newMessage.message.substring(0, 50) + (newMessage.message.length > 50 ? "..." : ""),
                  duration: 3000
                })
              }
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedMessage = payload.new as ChatMessage
            setMessages(prev => prev.map(msg => 
              msg.id === updatedMessage.id ? updatedMessage : msg
            ))
          }
        }
      )
      .subscribe()

    subscriptionRef.current = channel
  }

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const messageText = newMessage.trim()
    setNewMessage('')
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          sender_id: staffId,
          sender_name: staffName,
          sender_role: 'staff',
          receiver_id: adminId,
          receiver_role: 'admin',
          message: messageText,
          delivered: true,
          delivered_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Update delivered status for admin messages
      setTimeout(async () => {
        await supabase
          .from('chat_messages')
          .update({ 
            delivered: true, 
            delivered_at: new Date().toISOString() 
          })
          .eq('id', data.id)
      }, 1000)

    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Format time
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  // Get read receipt icon
  const getReadReceiptIcon = (message: ChatMessage) => {
    if (message.sender_id !== staffId) return null // Only show for own messages
    
    if (message.read) {
      return <CheckCheck className="h-4 w-4 text-blue-500" />
    } else if (message.delivered) {
      return <CheckCheck className="h-4 w-4 text-gray-400" />
    } else {
      return <Check className="h-4 w-4 text-gray-400" />
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-[9998]">
        <Button
          onClick={() => {
            setIsOpen(true)
            setUnreadCount(0)
          }}
          className="bg-gradient-to-r from-[#2a9d8f] to-[#264653] hover:from-[#2a9d8f]/90 hover:to-[#264653]/90 text-white rounded-full p-4 shadow-lg relative border-2 border-white/30 backdrop-blur-xl"
          size="lg"
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs border-2 border-white">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div ref={chatRef} className="fixed bottom-4 right-4 z-[9998] w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col max-h-[80vh]">
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-[#2a9d8f] to-[#264653] text-white p-4 rounded-t-lg flex-shrink-0 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-poppins">Admin Communication</CardTitle>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-300' : 'bg-gray-400'}`} />
              <span className="text-xs">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20 p-1 rounded-lg"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-white/90">
            {shareLocation ? <MapPin className="h-3.5 w-3.5" /> : <MapPinOff className="h-3.5 w-3.5" />}
            <span>
              {shareLocation
                ? hasLocationPermission === false
                  ? locationError || 'Location not available'
                  : 'Live location sharing is enabled'
                : 'Live location sharing is paused'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShareLocation((prev) => !prev)
              if (shareLocation) {
                latestLocationRef.current = null
              }
            }}
            className="text-white hover:bg-white/20 h-7 px-2"
          >
            {shareLocation ? 'Pause' : 'Share'}
          </Button>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No messages yet. Start a conversation!
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === staffId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-3 py-2 ${
                      message.sender_id === staffId
                        ? 'bg-gradient-to-r from-[#2a9d8f] to-[#264653] text-white shadow-lg'
                        : 'bg-gray-100 text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm break-words">{message.message}</p>
                    <div className={`flex items-center justify-between gap-2 mt-1 ${
                      message.sender_id === staffId ? 'flex-row-reverse' : 'flex-row'
                    }`}>
                      <span className={`text-xs ${
                        message.sender_id === staffId ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        {formatTime(message.created_at)}
                      </span>
                      {getReadReceiptIcon(message)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Input */}
      <div className="p-4 border-t flex-shrink-0">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isLoading}
            className="bg-gradient-to-r from-[#2a9d8f] to-[#264653] hover:from-[#2a9d8f]/90 hover:to-[#264653]/90 text-white shadow-lg border-2 border-white/30"
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
