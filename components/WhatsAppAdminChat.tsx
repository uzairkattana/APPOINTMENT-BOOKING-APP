'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MessageCircle, X, Send, Check, CheckCheck, Users, Circle, MessageSquare, MapPin, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface WhatsAppAdminChatProps {
  adminId?: string
  adminName?: string
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

interface StaffMember {
  user_id: string
  user_name: string
  is_online: boolean
  last_seen: string
  latitude?: number | null
  longitude?: number | null
  location_accuracy_meters?: number | null
  location_updated_at?: string | null
  share_location?: boolean | null
  unread_count: number
}

export default function WhatsAppAdminChat({ adminId = 'admin-user', adminName = 'Admin' }: WhatsAppAdminChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<string>('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const subscriptionRef = useRef<any>(null)
  const { toast } = useToast()

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

  // Update admin online status
  useEffect(() => {
    const updateOnlineStatus = async () => {
      try {
        await supabase
          .from('user_status')
          .upsert({
            user_id: adminId,
            user_name: adminName,
            user_role: 'admin',
            is_online: true,
            last_seen: new Date().toISOString()
          })
      } catch (error) {
        console.error('Error updating online status:', error)
      }
    }

    if (adminId) {
      updateOnlineStatus()
      const interval = setInterval(updateOnlineStatus, 30000)
      
      return () => {
        clearInterval(interval)
        supabase
          .from('user_status')
          .upsert({
            user_id: adminId,
            user_name: adminName,
            user_role: 'admin',
            is_online: false,
            last_seen: new Date().toISOString()
          })
      }
    }
  }, [adminId, adminName])

  // Load staff members and their status
  const loadStaffMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_status')
        .select('*')
        .eq('user_role', 'staff')
        .order('user_name')

      if (error) throw error

      const staffWithUnread = await Promise.all(
        (data || []).map(async (staff: any) => {
          // Count unread messages from this staff
          const { data: unreadData } = await supabase
            .from('chat_messages')
            .select('id')
            .eq('sender_id', staff.user_id)
            .eq('receiver_id', adminId)
            .eq('read', false)

          return {
            ...staff,
            unread_count: unreadData?.length || 0
          }
        })
      )

      setStaffMembers(staffWithUnread)
      
      // Set unread counts
      const counts: Record<string, number> = {}
      staffWithUnread.forEach(staff => {
        counts[staff.user_id] = staff.unread_count
      })
      setUnreadCounts(counts)

      // Auto-select first staff if none selected
      if (!selectedStaff && staffWithUnread.length > 0) {
        setSelectedStaff(staffWithUnread[0].user_id)
      }
    } catch (error) {
      console.error('Error loading staff members:', error)
    }
  }

  // Load messages for selected staff
  const loadMessages = async () => {
    if (!selectedStaff) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error

      const filteredMessages = data?.filter(msg => 
        (msg.sender_id === adminId && msg.receiver_id === selectedStaff) ||
        (msg.sender_id === selectedStaff && msg.receiver_id === adminId)
      ) || []

      setMessages(filteredMessages)
      
      // Mark staff messages as read
      const staffMessages = filteredMessages.filter(msg => 
        msg.sender_id === selectedStaff && !msg.read
      )
      
      if (staffMessages.length > 0) {
        await supabase
          .from('chat_messages')
          .update({ 
            read: true, 
            read_at: new Date().toISOString() 
          })
          .in('id', staffMessages.map(msg => msg.id))
        
        // Update unread count
        setUnreadCounts(prev => ({
          ...prev,
          [selectedStaff]: 0
        }))
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
    if (isOpen) {
      loadStaffMembers()
      setupRealtimeSubscription()
    }
    
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current)
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && selectedStaff) {
      loadMessages()
    }
  }, [isOpen, selectedStaff])

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
            
            if ((newMessage.sender_id === adminId && newMessage.receiver_id === selectedStaff) ||
                (newMessage.sender_id === selectedStaff && newMessage.receiver_id === adminId)) {
              
              setMessages(prev => [...prev, newMessage])
              
              if (newMessage.sender_role === 'staff' && !isOpen) {
                setUnreadCounts(prev => ({
                  ...prev,
                  [newMessage.sender_id]: (prev[newMessage.sender_id] || 0) + 1
                }))
                toast({
                  title: `New message from ${newMessage.sender_name}`,
                  description: newMessage.message.substring(0, 50) + (newMessage.message.length > 50 ? "..." : ""),
                  duration: 3000
                })
              }
            }
            
            // Reload staff members to update online status
            loadStaffMembers()
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
    if (!newMessage.trim() || !selectedStaff) return

    const messageText = newMessage.trim()
    setNewMessage('')
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          sender_id: adminId,
          sender_name: adminName,
          sender_role: 'admin',
          receiver_id: selectedStaff,
          receiver_role: 'staff',
          message: messageText,
          delivered: true,
          delivered_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Update delivered status
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
    if (message.sender_id !== adminId) return null
    
    if (message.read) {
      return <CheckCheck className="h-4 w-4 text-blue-500" />
    } else if (message.delivered) {
      return <CheckCheck className="h-4 w-4 text-gray-400" />
    } else {
      return <Check className="h-4 w-4 text-gray-400" />
    }
  }

  // Get selected staff name
  const selectedStaffName = staffMembers.find(staff => staff.user_id === selectedStaff)?.user_name || 'Unknown'
  const selectedStaffMember = staffMembers.find(staff => staff.user_id === selectedStaff)
  const hasStaffLocation =
    selectedStaffMember?.share_location !== false &&
    typeof selectedStaffMember?.latitude === 'number' &&
    typeof selectedStaffMember?.longitude === 'number'

  const mapsUrl = hasStaffLocation
    ? `https://www.google.com/maps?q=${selectedStaffMember?.latitude},${selectedStaffMember?.longitude}`
    : ''

  const formatLocationAge = (updatedAt?: string | null) => {
    if (!updatedAt) return 'Unknown update time'

    const seconds = Math.max(0, Math.floor((Date.now() - new Date(updatedAt).getTime()) / 1000))
    if (seconds < 60) return 'Updated just now'

    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `Updated ${minutes}m ago`

    const hours = Math.floor(minutes / 60)
    return `Updated ${hours}h ago`
  }

  if (!isOpen) {
    const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0)
    
    return (
      <div className="fixed bottom-4 right-4 z-[9999]">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] hover:from-[#0d5c75]/90 hover:to-[#2a9d8f]/90 text-white rounded-full p-4 shadow-lg relative border-2 border-white/30 backdrop-blur-xl"
          size="lg"
        >
          <MessageSquare className="h-6 w-6" />
          {totalUnread > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs border-2 border-white">
              {totalUnread}
            </Badge>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div ref={chatRef} className="fixed bottom-4 right-4 z-[9999] w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col max-h-[80vh]">
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white p-4 rounded-t-lg flex-shrink-0 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <CardTitle className="text-lg font-poppins">Staff Communication</CardTitle>
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
        
        {/* Staff Selector */}
        <div className="mt-2">
          <Select value={selectedStaff} onValueChange={setSelectedStaff}>
            <SelectTrigger className="bg-white/20 border-white/30 text-white backdrop-blur-sm">
              <SelectValue placeholder="Select staff member" />
            </SelectTrigger>
            <SelectContent>
              {staffMembers.map((staff) => (
                <SelectItem key={staff.user_id} value={staff.user_id}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${staff.is_online ? 'bg-green-400' : 'bg-gray-400'}`} />
                      <span>{staff.user_name}</span>
                    </div>
                    {unreadCounts[staff.user_id] > 0 && (
                      <Badge className="bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs border-2 border-white">
                        {unreadCounts[staff.user_id]}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedStaff && (
          <div className="mt-2 rounded-md bg-white/15 border border-white/20 p-2 text-xs text-white/90">
            {hasStaffLocation ? (
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Live location available for {selectedStaffName}</span>
                </div>
                <div>{formatLocationAge(selectedStaffMember?.location_updated_at)}</div>
                {selectedStaffMember?.location_accuracy_meters != null && (
                  <div>Accuracy: {Math.round(selectedStaffMember.location_accuracy_meters)}m</div>
                )}
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 underline hover:text-white"
                >
                  Open exact location in Google Maps
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span>Live location is not available for {selectedStaffName}</span>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4">
          {selectedStaff ? (
            messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No messages with {selectedStaffName}. Start a conversation!
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === adminId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-3 py-2 ${
                        message.sender_id === adminId
                          ? 'bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white shadow-lg'
                          : 'bg-gray-100 text-gray-900 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm break-words">{message.message}</p>
                      <div className={`flex items-center justify-between gap-2 mt-1 ${
                        message.sender_id === adminId ? 'flex-row-reverse' : 'flex-row'
                      }`}>
                        <span className={`text-xs ${
                          message.sender_id === adminId ? 'text-white/80' : 'text-gray-500'
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
            )
          ) : (
            <div className="text-center text-gray-500 py-8">
              Select a staff member to start chatting
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
            placeholder={`Message ${selectedStaffName}...`}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
            disabled={!selectedStaff || isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !selectedStaff || isLoading}
            className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] hover:from-[#0d5c75]/90 hover:to-[#2a9d8f]/90 text-white shadow-lg border-2 border-white/30"
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
